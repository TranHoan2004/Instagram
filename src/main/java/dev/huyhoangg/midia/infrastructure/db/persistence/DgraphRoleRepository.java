package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.google.protobuf.ByteString;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.user.Role;
import dev.huyhoangg.midia.domain.repository.user.RoleRepository;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collections;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class DgraphRoleRepository implements RoleRepository {
    private final DgraphTemplate dgraphTemplate;
    private final DgraphMappingProcessor mappingProcessor;

    @Override
    public Role save(Role role) {
        return dgraphTemplate.executeMutation(txn -> {
            var jsonReq = mappingProcessor.toDgraphNode(role);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            txn.mutate(mutation);
            txn.commit();
            return role;
        });
    }

    @Override
    public Optional<Role> findByName(String name) {
        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var query = QueryBuilder.builder()
                    .queryName("find_role_by_name")
                    .queryParams(new QueryParams("$name", QueryParamType.STRING))
                    .forType(Role.class)
                    .filterEquals("role.name", "$name")
                    .limit(1)
                    .build();

            var vars = Collections.singletonMap("$name", name);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Role.class);
            return result.iterator().next();
        });
    }

    @Override
    public void delete(String name) {
        dgraphTemplate.executeMutation(txn -> {
            var query = String.format("""
                    query find_role_by_name {
                        role_uid as var(func: eq(role.name, %s) { uid }
                    }
                    """, name);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setDelNquads(ByteString.copyFromUtf8("uid(role_uid) * *"))
                    .setCond("@if(gt(len(role_uid), 0))")
                    .build();
            var request = DgraphProto.Request.newBuilder()
                    .setQuery(query)
                    .addMutations(mutation)
                    .setCommitNow(true)
                    .build();
            txn.doRequest(request);
            txn.commit();
        });
    }
}
