package dev.huyhoangg.midia.business.user;

import com.google.protobuf.ByteString;

import dev.huyhoangg.midia.infrastructure.db.persistence.DgraphTemplate;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

@Service
@Lazy
@RequiredArgsConstructor
@Slf4j
public class UserInteractionServiceImpl implements UserInteractionService {
    private final DgraphTemplate dgraphTemplate;

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
                            uid(currentUserStats) <user_stats.total_followings> val(decreaseCurrentTotalFl) .
                            uid(targetUserStats) <user_stats.total_followers> val(decreaseTargetTotalFl) .
                            """))
                .setCond("@if(gt(len(followsEdges), 0))")
                .build();

        return dgraphTemplate.executeUpsertReturnSuccess(query, addFollow, deleteFollow);
    }

    @Override
    public boolean toggleBlock(String currentUserId, String targetUserId) {
        return false;
    }
}
