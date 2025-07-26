package dev.huyhoangg.midia.business.user;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;

import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import dev.huyhoangg.midia.infrastructure.db.persistence.DgraphTemplate;
import dev.huyhoangg.midia.infrastructure.util.ConnectionUtil;
import graphql.relay.*;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Lazy
@RequiredArgsConstructor
@Slf4j
public class UserInteractionServiceImpl implements UserInteractionService {
    private final DgraphTemplate dgraphTemplate;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final UserMapper userMapper;

    @Override
    public boolean toggleFollow(String currentUserId, String targetUserId) {
        var query = String.format(
                """
                        query {
                            var(func: type(User))
                            @filter(eq(id, "%s") AND not(has(deleted_at))) {
                              currentUserUid as uid
                              user.stats {
                                currentUserStats as uid
                                currentTotalFl as user_stats.total_followings
                                increaseCurrentTotalFl as math(currentTotalFl + 1)
                                decreaseCurrentTotalFl as math(currentTotalFl - 1)
                              }
                            }

                            var(func: type(User))
                                @filter(eq(id, "%s") AND not(has(deleted_at))) {
                              targetUserUid as uid
                              user.stats {
                                targetUserStats as uid
                                targetTotalFl as user_stats.total_followers
                                increaseTargetTotalFl as math(targetTotalFl + 1)
                                decreaseTargetTotalFl as math(targetTotalFl - 1)
                              }
                            }

                            var(func: uid(currentUserUid)) {
                              followsEdges as user.followings @filter(uid(targetUserUid))
                            }
                        }
                        """,
                currentUserId, targetUserId);
        var addFollow = DgraphProto.Mutation.newBuilder()
                .setSetNquads(
                        ByteString.copyFromUtf8(
                                """
                                        uid(currentUserUid) <user.followings> uid(targetUserUid) .
                                        uid(targetUserUid) <user.followers> uid(currentUserUid) .
                                        uid(currentUserStats) <user_stats.total_followings> val(increaseCurrentTotalFl) .
                                        uid(targetUserStats) <user_stats.total_followers> val(increaseTargetTotalFl) .
                                        """))
                .setCond("@if(eq(len(followsEdges), 0))")
                .build();

        var deleteFollow = DgraphProto.Mutation.newBuilder()
                .setDelNquads(
                        ByteString.copyFromUtf8(
                                """
                                        uid(currentUserUid) <user.followings> uid(targetUserUid) .
                                        uid(targetUserUid) <user.followers> uid(currentUserUid) .
                                        """))
                .setCond("@if(gt(len(followsEdges), 0))")
                .build();

        var decreaseFollow = DgraphProto.Mutation.newBuilder()
                .setCond("@if(gt(len(followsEdges), 0))")
                .setSetNquads(
                        ByteString.copyFromUtf8(
                                """
                                uid(currentUserStats) <user_stats.total_followings> val(decreaseCurrentTotalFl) .
                                uid(targetUserStats) <user_stats.total_followers> val(decreaseTargetTotalFl) .
                                """))
                .build();

        return dgraphTemplate.executeUpsertReturnSuccess(query, addFollow, deleteFollow, decreaseFollow);
    }

    @Override
    public boolean toggleBlock(String currentUserId, String targetUserId) {
        return false;
    }

    @Override
    public Connection<User> suggestUsers(String userId, Integer first, Integer offset) {
        var user = userRepository.findById(userId).orElseThrow(UserNotExistsException::new);

        if (user.getStats().getTotalFollowings() == 0) {
            return getInitialSuggestion(user.getId(), first, offset);
        }

        return getSuggestion(user.getId(), first, offset);
    }

    private Connection<User> getInitialSuggestion(String userId, Integer first, Integer offset) {
        var users = userRepository.findUsersOrderByTotalFollowersExceptUser(userId, first + 1, offset);

        return ConnectionUtil.buildConnectionForOffsetBased(users, first, offset, userMapper::toGraphQLUserType);
    }

    private Connection<User> getSuggestion(String userId, Integer first, Integer offset) {
        var users = userRepository.suggestUsers(userId, first + 1, offset);

        return ConnectionUtil.buildConnectionForOffsetBased(users, first, offset, userMapper::toGraphQLUserType);
    }
}
