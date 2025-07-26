package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.google.protobuf.ByteString;
import dev.huyhoangg.midia.business.user.UserNotExistsException;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.repository.user.UserProfileRepository;
import io.dgraph.DgraphProto;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DgraphUserProfileRepository implements UserProfileRepository {
    DgraphMappingProcessor mappingProcessor;
    DgraphTemplate dgraphTemplate;

    @Override
    public UserProfile updateProfile(UserProfile profile, String userId) {
        log.info("updateProfile: userId={}, profile={}", userId, profile);

        var query = QueryBuilder.builder()
                .queryName("find_user_by_id")
                .forType(User.class)
                .limit(1)
                .filterHas("id")
                .queryParams(new QueryParams("$id", QueryParamType.STRING))
                .filterEquals("id", "$id")
                .build();

        User user = dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$id", userId);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        }).orElseThrow(UserNotExistsException::new);

        var p = user.getProfile();
        p.setAvatarUrl(profile.getAvatarUrl());
        p.setFullName(profile.getFullName() == null ? p.getFullName() : profile.getFullName());

        dgraphTemplate.executeMutation(txn -> {
            var jsonReq = mappingProcessor.toDgraphNode(p);
            log.info("jsonReq: {}", jsonReq);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            txn.mutate(mutation);
            txn.commit();
        });
        return p;
    }
}
