package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.google.protobuf.ByteString;

import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.user.Permission;
import dev.huyhoangg.midia.domain.repository.user.PermissionRepository;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphPermissionRepository implements PermissionRepository {
    private final DgraphTemplate dgraphTemplate;
    private final DgraphMappingProcessor mappingProcessor;

    @Override
    public Permission save(Permission permission) {
        return null;
    }

    @Override
    public Set<Permission> findAll() {
        var query = QueryBuilder.builder().forType(Permission.class).build();

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var response = txn.query(query);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Permission.class);
            return new HashSet<>(result);
        });
    }

    @Override
    public Optional<Permission> findByAction(String action) {
        var query = QueryBuilder.builder()
                .queryName("find_permission_by_action")
                .queryParams(new QueryParams("$action", QueryParamType.STRING))
                .forType(Permission.class)
                .filterEquals("action", "$action")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$action", action);
            var response = txn.queryWithVars(query, vars);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Permission.class);
            return result.iterator().next();
        });
    }

    @Override
    public Set<Permission> findAllByActions(Collection<String> actions) {
        var query =
                """
                {
                    q(func: type(Permission)) {
                        uid
                        expand(_all_)
                    }
                }
                """;

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var response = txn.query(query);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Permission.class);
            return new HashSet<>(result);
        });
    }

    @Override
    public Collection<Permission> findAllByRoleName(String roleName) {
        var query =
                """
                query find_permissions_by_role_name($roleName: string) {
                    q(func: eq(role_name, $roleName)) @filter(type(Permission)) {
                        uid
                        expand(_all_)
                    }
                }
                """;

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = Collections.singletonMap("$roleName", roleName);
            var response = txn.queryWithVars(query, vars);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Permission.class);
            return new HashSet<>(result);
        });
    }

    @Override
    public void delete(String action) {
        var query = String.format(
                """
                {
                    permission(func: type(Permission)) @filter(eq(action, %s)) {
                        permission_id as uid
                    }
                }
                """,
                action);
        var mutation = DgraphProto.Mutation.newBuilder()
                .setDelNquads(ByteString.copyFromUtf8("uid(permission_id) * * ."))
                .setCond("@if(gt(len(permission_id), 0))")
                .build();
        dgraphTemplate.executeUpsert(query, mutation);
    }

    @Override
    public Collection<Permission> saveAll(Collection<Permission> permissions) {
        permissions.forEach(permission -> {
            permission.setUid("_:" + UUID.randomUUID());
        });
        var mutation = DgraphProto.Mutation.newBuilder()
                .setSetJson(ByteString.copyFromUtf8(permissions.stream()
                        .map(permission -> {
                            try {
                                return mappingProcessor.toDgraphNode(permission);
                            } catch (JsonProcessingException e) {
                                log.info("Error mapping permission: {}", permission, e);
                                return null;
                            }
                        })
                        .collect(Collectors.joining(","))))
                .build();
        log.info("mutation: {}", mutation);

        var uids = dgraphTemplate.executeMutation(txn -> {
            var response = txn.mutate(mutation);
            txn.commit();
            return new HashSet<>(response.getUidsMap().keySet());
        });

        return Set.of();
    }
}
