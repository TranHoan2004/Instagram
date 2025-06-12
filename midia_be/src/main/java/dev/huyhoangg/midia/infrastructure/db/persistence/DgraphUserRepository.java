package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphUserRepository implements UserRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public boolean existsByEmail(String email) {
        var query = QueryBuilder.builder()
                .queryName("user_exists_by_email")
                .queryParams(new QueryParams("$email", QueryParamType.STRING))
                .forType(User.class)
                .filterEquals("user.email", "$email")
                .fetchUidOnly(true)
                .limit(1)
                .build();
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = Collections.singletonMap("$email", email);
            var response = txn.queryWithVars(query, vars);
            var jsonTree = objectMapper.readTree(response.getJson().toStringUtf8());
            var result = objectMapper.readValue(jsonTree.get("q").toString(),
                    new TypeReference<List<Map<String, Object>>>() {
                    });
            return !result.isEmpty();
        });
    }

    @Override
    public boolean existsByUsername(String username) {
        var query = QueryBuilder.builder()
                .queryName("user_exists_by_username")
                .queryParams(new QueryParams("$username", QueryParamType.STRING))
                .forType(User.class)
                .filterEquals("user.user_name", "$username")
                .fetchUidOnly(true)
                .limit(1)
                .build();
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = Collections.singletonMap("$username", username);
            var response = txn.queryWithVars(query, vars);
            var jsonTree = objectMapper.readTree(response.getJson().toStringUtf8());
            var result = objectMapper.readValue(jsonTree.get("q").toString(),
                    new TypeReference<List<Map<String, Object>>>() {
                    });
            return !result.isEmpty();
        });
    }

    @Override
    public Optional<User> findById(String id) {
        var query = QueryBuilder.builder()
                .queryName("find_user_by_id")
                .queryParams(new QueryParams("$id", QueryParamType.STRING))
                .forType(User.class)
                .filterEquals("id", "$id")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$id", id);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        });
    }

    @Override
    public Optional<User> findByEmail(String email) {
        var query = QueryBuilder.builder()
                .queryName("find_user_by_email")
                .queryParams(new QueryParams("$email", QueryParamType.STRING))
                .forType(User.class)
                .filterEquals("user.email", "$email")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$email", email);
            var response = txn.queryWithVars(query, vars);
            log.info("{}", response.getJson().toStringUtf8());
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        });
    }

    @Override
    public Optional<User> findByUsername(String username) {
        var query = QueryBuilder.builder()
                .queryName("find_user_by_username")
                .queryParams(new QueryParams("$username", QueryParamType.STRING))
                .forType(User.class)
                .filterEquals("user.user_name", "$username")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$username", username);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        });
    }

    @Override
    public User save(User user) {
        dgraphTemplate.executeMutation(txn -> {
            var jsonReq = mappingProcessor.toDgraphNode(user);
            log.info("jsonReq: {}", jsonReq);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            txn.mutate(mutation);
            txn.commit();
        });
        return user;
    }
}
