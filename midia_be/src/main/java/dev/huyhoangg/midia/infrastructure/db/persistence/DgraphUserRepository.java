package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;

import dev.huyhoangg.midia.business.user.UserMapper;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.user.SocialAccount;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import graphql.relay.*;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphUserRepository implements UserRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objectMapper;
    private final UserMapper userMapper;

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
            var result = objectMapper.readValue(
                    jsonTree.get("q").toString(), new TypeReference<List<Map<String, Object>>>() {});
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
            var result = objectMapper.readValue(
                    jsonTree.get("q").toString(), new TypeReference<List<Map<String, Object>>>() {});
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
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
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
            log.info("find user by email: {}", response.getJson().toStringUtf8());
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
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
            log.info("find user by username: {}", response.getJson().toStringUtf8());
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        });
    }

    @Override
    public User save(User user) {
        var uid = dgraphTemplate.executeMutation(txn -> {
            var isUpdate = user.getUid() != null && !user.getUid().isBlank();
            if (!isUpdate) {
                user.setUid("_:" + user.getId());
            }
            var jsonReq = mappingProcessor.toDgraphNode(user);
            log.info("jsonReq: {}", jsonReq);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            var response = txn.mutate(mutation);
            txn.commit();

            if (!isUpdate) {
                return response.getUidsMap().get(user.getId());
            }

            return user.getUid();
        });
        return findUserByUid(uid).orElseThrow();
    }

    @Override
    public Collection<SocialAccount> findSocialAccountsByUserUid(String uid) {
        var query = String.format(
                """
                        {
                            var(func: uid(%s)) @filter(type(User)) {
                                sa as user.social_accounts
                            }

                            q(func: uid(sa)) @filter(type(SocialAccount)) {
                                uid
                                dgraph.type
                                expand(_all_)
                            }
                        }
                        """,
                uid);
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var response = txn.query(query);
            return mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), SocialAccount.class);
        });
    }

    @Override
    public Optional<User> findByPostId(String postId) {
        var query =
                """
                find_author_by_post_id($post_id: string) {
                    var(func: type(Post)) @filter(eq(post.id, $post_id)) {
                        post.author {
                            user_id as uid
                        }
                    }

                    q(func: uid(user_id)) @filter(type(User)) {
                        uid
                        dgraph.type
                        expand(_all_) {
                            uid
                            dgraph.type
                            expand(UserProfile, UserStats, Role)
                        }
                    }
                }
                """;

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$post_id", postId);
            var response = txn.queryWithVars(query, vars);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        });
    }

    @Override
    public List<User> suggestUsers(String userId, Integer first, Integer offset) {
        var query =
                """
                query suggestion($userId: string, $first: int = 10, $offset: int = 0) {
                 	var(func: type(User)) @filter(eq(id, $userId)) {
                 		my_followings as user.followings @filter(type(User) AND NOT has(deleted_at))
                 	}

                 	var(func: uid(my_followings)) {
                 		second_degree as user.followings @filter(type(User) AND NOT has(deleted_at))
                 	}

                    friends_of_friends(func: uid(second_degree), first: $first, offset: $offset)
                    @filter(not(uid(my_followings)) AND not(eq(id, $userId))) {
                        uid
                        expand(_all_) {
                            expand(Role, UserProfile, UserStats)
                        }
                    }
                }
                """;

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$userId", userId);
            vars.put("$first", first.toString());
            vars.put("$offset", offset.toString());
            var response = txn.queryWithVars(query, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var friends = json.get("friends_of_friends");

            return objectMapper.readValue(friends.toString(), new TypeReference<>() {});
        });
    }

    @Override
    public List<User> findUsersOrderByTotalFollowersExceptUser(String userId, Integer first, Integer offset) {
        var query =
                """
                query initial($userId: string, $first: int, $offset: int) {
                    var(func: type(User)) {
                        user.stats {
                          total_follower as user_stats.total_followers\s
                        }

                        total_follower_val as max(val(total_follower))
                    }

                    users(func: type(User), orderdesc: val(total_follower_val), first: $first, offset: $offset)
                    @filter(not(eq(id, $userId))) {
                        uid
                        expand(_all_) {
                            expand(Role, UserProfile, UserStats)
                        }
                    }
                }
                """;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$userId", userId);
            vars.put("$first", first.toString());
            vars.put("$offset", offset.toString());
            var response = txn.queryWithVars(query, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var friends = json.get("users");

            return objectMapper.readValue(friends.toString(), new TypeReference<>() {});
        });
    }

    @Override
    public List<User> findAllUsersHasLastLoginAtAfter(Instant instant) {
        var query =
                """
                        query find_all_users_has_last_login_at_after($instant: string) {
                            q(func: type(User)) @filter(
                                has(user.last_login_at)
                                AND gt(user.last_login_at, $instant)
                                AND NOT has(deleted_at)
                            ) {
                                uid
                                expand(_all_) {
                                    expand(Role, UserStats, UserProfile)
                                }
                            }
                        }
                """;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = Collections.singletonMap("$instant", instant.toString());
            var response = txn.queryWithVars(query, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var friends = json.get("q");

            return objectMapper.readValue(friends.toString(), new TypeReference<>() {});
        });
    }

    @Override
    public void setLoginAt(String userId, Instant instant) {
        var query =
                """
                query {
                    user as var(func: type(User)) @filter(eq(id, %s) AND not(has(deleted_at)))
                }
                """;
        var mutation = DgraphProto.Mutation.newBuilder()
                .setSetNquads(ByteString.copyFromUtf8(String.format(
                        """
                        uid(user) <user.last_login_at> "%s" .
                        """,
                        instant.toString())))
                .build();
        dgraphTemplate.executeUpsert(query, mutation);
    }

    @Override
    public Optional<User> findUserByUid(String uid) {
        var query = String.format(
                """
                            {
                                q(func: uid(%s)) @filter(type(User)) {
                                    uid
                                    dgraph.type
                                    expand(User) {
                                        uid
                                        dgraph.type
                                        expand(UserProfile, UserStats, Role)
                                    }
                                }
                            }
                        """,
                uid);
        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var response = txn.query(query);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.iterator().next();
        });
    }

    @Override
    public void updatePassword(String userId, String newPassword) {
        try {
            dgraphTemplate.executeMutation(txn -> {
                // Lấy tất cả node User có id này
                var checkQuery = String.format(
                        """
                {
                    q(func: eq(id, \"%s\")) @filter(type(User)) {
                        uid
                    }
                }
                """,
                        userId);

                var checkResponse = txn.query(checkQuery);
                var jsonTree = objectMapper.readTree(checkResponse.getJson().toStringUtf8());
                var userArray = jsonTree.get("q");

                if (userArray == null || userArray.size() == 0) {
                    throw new RuntimeException("User not found with ID: " + userId);
                }

                // Update password cho tất cả node có cùng id
                for (JsonNode userData : userArray) {
                    var uid = userData.get("uid").asText();
                    var updateJson = String.format(
                            """
                {
                    \"uid\": \"%s\",
                    \"user.password\": \"%s\",
                    \"updated_at\": \"%s\"
                }
                """,
                            uid, newPassword, java.time.Instant.now().toString());

                    var mutation = DgraphProto.Mutation.newBuilder()
                            .setSetJson(ByteString.copyFromUtf8(updateJson))
                            .build();

                    txn.mutate(mutation);
                }
                txn.commit();
                return null;
            });
        } catch (Exception e) {
            throw new RuntimeException("Failed to update password for user: " + userId, e);
        }
    }

    @Override
    public Optional<User> findByIdWithFollowers(String id) {
        var query = 
                """
                        query find_user_with_followers($id: string) {
                            q(func: type(User)) @filter(eq(id, $id)) {
                                uid
                                dgraph.type
                                id
                                user.user_name
                                user.email
                                user.password
                                user.is_locked
                                user.is_email_verified
                                created_at
                                updated_at
                                deleted_at
                                user.profile {
                                    uid
                                    dgraph.type
                                    expand(UserProfile)
                                }
                                user.stats {
                                    uid
                                    dgraph.type
                                    expand(UserStats)
                                }
                                user.role {
                                    uid
                                    dgraph.type
                                    expand(Role)
                                }
                                user.followers {
                                    uid
                                    dgraph.type
                                    id
                                    user.user_name
                                    user.profile {
                                        uid
                                        dgraph.type
                                        expand(UserProfile)
                                    }
                                    user.stats {
                                        uid
                                        dgraph.type
                                        expand(UserStats)
                                    }
                                    user.role {
                                        uid
                                        dgraph.type
                                        expand(Role)
                                    }
                                }
                            }
                        }
                        """;

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$id", id);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class);
            return result.isEmpty() ? null : result.iterator().next();
        });
    }

    @Override
    public graphql.relay.Connection<dev.huyhoangg.midia.codegen.types.User> findAllPaginated(
            Integer first, String after) {
        // Query for all users, ordered by created_at desc, with cursor-based pagination
        String baseQuery =
                """
            query all_users_order_by_created_at($first: int = 1000, $after: string) {
                q(func: type(User), orderdesc: created_at, first: $first)
                @filter(lt(created_at, $after)) {
                    uid
                    expand(User) {
                         uid
                         dgraph.type
                         expand(UserProfile, UserStats, Role)
                    }
                }
            }
        """;
        boolean isAfter = after != null && !after.isBlank();
        String query = baseQuery;
        if (!isAfter) {
            query = query.replace("@filter(lt(created_at, $after))", "");
        }
        final int finalFirst = first == null ? 1000 + 1 : first + 1;
        final String finalQuery = query;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new java.util.HashMap<String, String>();
            vars.put("$first", String.valueOf(finalFirst));
            if (isAfter) {
                vars.put(
                        "$after",
                        dev.huyhoangg.midia.infrastructure.util.ConnectionUtil.getValueFromConnectionCursor(
                                new graphql.relay.DefaultConnectionCursor(after)));
            }
            var response = txn.queryWithVars(finalQuery, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var userPayload = json.get("q");
            var users = objectMapper.readValue(
                    userPayload.toString(),
                    new com.fasterxml.jackson.core.type.TypeReference<
                            java.util.List<dev.huyhoangg.midia.domain.model.user.User>>() {});
            java.util.List<graphql.relay.Edge<dev.huyhoangg.midia.codegen.types.User>> edges =
                    new java.util.ArrayList<>();
            for (var user : users) {
                if(user.getCreatedAt() == null) {
                    continue;
                }
                var gqlUser = userMapper.toGraphQLUserType(user);
                var cursor = dev.huyhoangg.midia.infrastructure.util.ConnectionUtil.connectionCursor(
                        user.getCreatedAt().toString());
                edges.add(new graphql.relay.DefaultEdge<>(gqlUser, cursor));
            }
            boolean hasNextPage = edges.size() > (first != null ? first : 1000);
            if (hasNextPage) {
                edges.remove(edges.size() - 1);
            }
            graphql.relay.PageInfo pageInfo = new graphql.relay.DefaultPageInfo(
                    edges.isEmpty() ? null : edges.get(0).getCursor(),
                    edges.isEmpty() ? null : edges.get(edges.size() - 1).getCursor(),
                    isAfter,
                    hasNextPage);
            return new graphql.relay.DefaultConnection<>(edges, pageInfo);
        });
    }
}
