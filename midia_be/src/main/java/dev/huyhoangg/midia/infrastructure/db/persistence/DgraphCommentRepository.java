package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;

import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.comment.Comment;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.comment.CommentRepository;
import dev.huyhoangg.midia.infrastructure.util.ConnectionUtil;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultConnectionCursor;
import graphql.relay.DefaultEdge;
import graphql.relay.DefaultPageInfo;
import graphql.relay.Edge;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphCommentRepository implements CommentRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objectMapper;

    private static final Integer DEFAULT_UNLIMITED = 1000;

    private static final String FIND_COMMENTS_BY_POST_ID_ORDER_BY_CREATED_AT =
            """
        query find_comments_by_post_order_by_created_at($postId: string, $first: int = 1000, $after: string) {
             q(func: type(Post)) @filter(eq(id, $postId)) {
                 comments : post.comments(orderdesc: created_at, first: $first)
                 @filter(lt(created_at, $after)) {
                     uid
                     id
                     comment.content
                     created_at
                     updated_at
                     deleted_at
                     comment.total_likes
                     comment.author {
                         id
                         user.user_name
                         user.profile {
                             user_profile.avatar_url
                             user_profile.full_name
                         }
                     }
                 }
             }
        }
        """;

    private static final String FIND_REPLIES_BY_PARENT_ID_ORDER_BY_CREATED_AT =
            """
            query find_replies_by_parent_order_by_created_at($parentId: string, $first: int = 1000, $after: string) {
                 q(func: uid($parentId)) {
                     replies : comment.replies(orderdesc: created_at, first: $first)
                     @filter(lt(created_at, $after))
                     {
                         uid
                         expand(_all_)
                     }
                 }
            }
            """;

    private static final String FIND_LIKES_BY_COMMENT_ID_ORDER_BY_LIKED_AT =
            """
            query find_likes_by_comment_order_by_liked_at($commentId: string, $first: int = 1000, $after: string) {
                 q(func: uid($commentId)) {
                     likes: comment.liked_by @facets(liked_at) (orderdesc: liked_at, first: $first)
                     @filter(lt(liked_at, $after)) {
                         uid
                         expand(_all_)
                     }
                 }
            }
            """;

    @Override
    public Comment save(Comment comment) {
        var isUpdate = comment.getUid() != null && !comment.getUid().isBlank();
        if (!isUpdate) {
            comment.setUid("_:" + comment.getId());
        }
        return dgraphTemplate.executeMutation(txn -> {
            var jsonReq = mappingProcessor.toDgraphNode(comment);
            log.info("jsonReq: {}", jsonReq);

            var createComment = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();

            var mutations = new ArrayList<DgraphProto.Mutation>();
            mutations.add(createComment);

            // Create post-comment relationship
            if (comment.getPost() != null) {
                var createPostCommentRelationship = DgraphProto.Mutation.newBuilder()
                        .setSetJson(ByteString.copyFromUtf8(String.format(
                                """
                                {
                                    "uid": "%s",
                                    "post.comments": [
                                        {
                                            "uid": "%s"
                                        }
                                    ]
                                }
                                """,
                                comment.getPost().getUid(), comment.getUid())))
                        .build();
                mutations.add(createPostCommentRelationship);
            }

            // Create parent-reply relationship if this is a reply
            if (comment.getParent() != null) {
                var createParentReplyRelationship = DgraphProto.Mutation.newBuilder()
                        .setSetJson(ByteString.copyFromUtf8(String.format(
                                """
                                {
                                    "uid": "%s",
                                    "comment.replies": [
                                        {
                                            "uid": "%s"
                                        }
                                    ]
                                }
                                """,
                                comment.getParent().getUid(), comment.getUid())))
                        .build();
                mutations.add(createParentReplyRelationship);
            }

            var requestBuilder = DgraphProto.Request.newBuilder();
            for (int i = 0; i < mutations.size(); i++) {
                requestBuilder.addMutations(i, mutations.get(i));
            }
            var request = requestBuilder.setCommitNow(true).build();

            var response = txn.doRequest(request);
            if (!isUpdate) {
                var uid = response.getUidsMap().get(comment.getId());
                comment.setUid(uid);
            }
            return comment;
        });
    }

    public Optional<Comment> findById(String id) {
        var query = QueryBuilder.builder()
                .queryName("find_comment_by_id")
                .queryParams(new QueryParams("$id", QueryParamType.STRING))
                .forType(Comment.class)
                .filterEquals("id", "$id")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$id", id);
            var response = txn.queryWithVars(query, vars);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Comment.class);
            return result.iterator().next();
        });
    }

    @Override
    public Connection<Comment> findByPostIdOrderByCreatedAt(String postId, Integer first, String after) {

        var finalFirst = first == null ? DEFAULT_UNLIMITED + 1 : first + 1;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$postId", postId);
            vars.put("$first", String.valueOf(finalFirst));
            vars.put("$after", "2099-01-01T00:00:00Z");

            var response = txn.queryWithVars(FIND_COMMENTS_BY_POST_ID_ORDER_BY_CREATED_AT, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            JsonNode qNode = json.get("q");
            if (qNode == null || !qNode.isArray() || qNode.isEmpty()) {
                return new DefaultConnection<>(Collections.emptyList(), new DefaultPageInfo(null, null, false, false));
            }

            JsonNode postNode = qNode.get(0);
            if (postNode == null) {
                return new DefaultConnection<>(Collections.emptyList(), new DefaultPageInfo(null, null, false, false));
            }

            JsonNode commentsPayload = postNode.get("comments");

            List<Comment> comments = objectMapper.readValue(commentsPayload.toString(), new TypeReference<>() {});

            List<Edge<Comment>> edges = comments.stream()
                    .map(comment -> {
                        var cursor = ConnectionUtil.connectionCursor(comment.getUid());
                        return new DefaultEdge<>(comment, cursor);
                    })
                    .collect(Collectors.toList());

            boolean hasNextPage = edges.size() > (first == null ? DEFAULT_UNLIMITED : first);
            if (hasNextPage) {
                edges.removeLast();
            }
            var pageInfo = new DefaultPageInfo(
                    edges.isEmpty() ? null : edges.getFirst().getCursor(),
                    edges.isEmpty() ? null : edges.getLast().getCursor(),
                    true,
                    hasNextPage);
            return new DefaultConnection<>(edges, pageInfo);
        });
    }

    @Override
    public Connection<Comment> findRepliesByParentIdOrderByCreatedAt(String parentId, Integer first, String after) {
        var query = FIND_REPLIES_BY_PARENT_ID_ORDER_BY_CREATED_AT;

        var isAfter = after != null && !after.isBlank();
        if (!isAfter) {
            query = query.replace("@filter(lt(created_at, $after))", "");
        }

        var finalQuery = query;
        var finalFirst = first == null ? DEFAULT_UNLIMITED + 1 : first + 1;

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$parentId", parentId);
            vars.put("$first", String.valueOf(finalFirst));
            if (isAfter) {
                vars.put("$after", ConnectionUtil.getValueFromConnectionCursor(new DefaultConnectionCursor(after)));
            }

            var response = txn.queryWithVars(finalQuery, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var repliesPayload = json.get("q").get(0).get("replies");
            var replies = objectMapper.readValue(repliesPayload.toString(), new TypeReference<List<Comment>>() {});

            List<Edge<Comment>> edges = replies.stream()
                    .map(reply -> {
                        var cursor = ConnectionUtil.connectionCursor(reply.getUid());
                        return new DefaultEdge<>(reply, cursor);
                    })
                    .collect(Collectors.toList());

            if (edges.size() > first) {
                edges.removeLast();
            }

            var pageInfo = new DefaultPageInfo(
                    edges.isEmpty() ? null : edges.getFirst().getCursor(),
                    edges.isEmpty() ? null : edges.getLast().getCursor(),
                    isAfter,
                    replies.size() > first);

            return new DefaultConnection<>(edges, pageInfo);
        });
    }

    @Override
    public void deleteById(String id) {
        Comment comment = findById(id).orElseThrow(() -> new RuntimeException("Comment not found"));
        comment.setDeletedAt(Instant.now());
        save(comment);
    }

    @Override
    public void addLike(String commentId, String userId) {
        dgraphTemplate.executeMutation(txn -> {
            var query =
                    """
            query addLikeQuery($commentId: string, $userId: string) {
              comment(func: eq(id, $commentId)) {
                uid
                totalLikes: comment.total_likes
                likedBy: comment.liked_by @filter(eq(id, $userId)) {
                  uid
                }
              }
              user(func: eq(id, $userId)) {
                uid
              }
            }
            """;

            var vars = Map.of("$commentId", commentId, "$userId", userId);
            var response = txn.queryWithVars(query, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());

            var commentNode = json.get("comment").get(0);
            if (commentNode == null) throw new RuntimeException("Comment not found");
            String commentUid = commentNode.get("uid").asText();
            long currentTotalLikes = commentNode.get("totalLikes").asLong();

            var likedByNode = commentNode.get("likedBy");
            boolean likeExists = likedByNode != null && !likedByNode.isEmpty();

            var userNode = json.get("user").get(0);
            if (userNode == null) throw new RuntimeException("User not found");
            String userUid = userNode.get("uid").asText();

            if (!likeExists) {
                var mutation = DgraphProto.Mutation.newBuilder()
                        .setSetNquads(ByteString.copyFromUtf8(String.format(
                                "<%s> <comment.liked_by> <%s> (liked_at=\"%s\") .\n"
                                        + "<%s> <comment.total_likes> \"%d\" .",
                                commentUid, userUid, Instant.now().toString(), commentUid, currentTotalLikes + 1)))
                        .build();
                txn.mutate(mutation);
            }
            txn.commit();
        });
    }

    @Override
    public void removeLike(String commentId, String userId) {
        dgraphTemplate.executeMutation(txn -> {
            var query =
                    """
                query {
                  comment(func: eq(id, $commentId)) {
                    uid
                    totalLikes: comment.total_likes
                    likedBy: comment.liked_by @filter(eq(id, $userId)) {
                      uid
                    }
                  }
                  user(func: eq(id, $userId)) {
                    uid
                  }
                }
                """;
            var vars = Map.of("$commentId", commentId, "$userId", userId);
            var response = txn.queryWithVars(query, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());

            var commentNode = json.get("comment").get(0);
            if (commentNode == null) throw new RuntimeException("Comment not found");
            String commentUid = commentNode.get("uid").asText();
            long currentTotalLikes = commentNode.get("totalLikes").asLong();
            boolean likeExists = !commentNode.get("likedBy").isEmpty();

            var userNode = json.get("user").get(0);
            if (userNode == null) throw new RuntimeException("User not found");
            String userUid = userNode.get("uid").asText();

            if (likeExists && currentTotalLikes > 0) {
                var mutation = DgraphProto.Mutation.newBuilder()
                        .setDelNquads(ByteString.copyFromUtf8(
                                String.format("<%s> <comment.liked_by> <%s> .", commentUid, userUid)))
                        .setSetNquads(ByteString.copyFromUtf8(String.format(
                                "<%s> <comment.total_likes> \"%d\" .", commentUid, currentTotalLikes - 1)))
                        .build();
                txn.mutate(mutation);
            }
            txn.commit();
        });
    }

    @Override
    public Connection<User> findLikesByCommentIdOrderByLikedAt(String commentId, Integer first, String after) {
        var query = FIND_LIKES_BY_COMMENT_ID_ORDER_BY_LIKED_AT;
        var isAfter = after != null && !after.isBlank();
        if (!isAfter) {
            query = query.replace("@filter(lt(liked_at, $after))", "");
        }

        var finalQuery = query;
        var finalFirst = first == null ? DEFAULT_UNLIMITED + 1 : first + 1;

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$commentId", commentId);
            vars.put("$first", String.valueOf(finalFirst));
            if (isAfter) {
                vars.put("$after", ConnectionUtil.getValueFromConnectionCursor(new DefaultConnectionCursor(after)));
            }

            var response = txn.queryWithVars(finalQuery, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var likesPayload = json.get("q").get(0).get("likes");
            var users = objectMapper.readValue(likesPayload.toString(), new TypeReference<List<User>>() {});

            List<Edge<User>> edges = new ArrayList<>();
            for (int i = 0; i < likesPayload.size(); i++) {
                var likeNode = likesPayload.get(i);
                var user = users.get(i);
                var likedAt = likeNode.get("facets").get("liked_at").asText();
                var cursor = ConnectionUtil.connectionCursor(likedAt);
                edges.add(new DefaultEdge<>(user, cursor));
            }

            if (edges.size() > first) {
                edges.removeLast();
            }

            var pageInfo = new DefaultPageInfo(
                    edges.isEmpty() ? null : edges.getFirst().getCursor(),
                    edges.isEmpty() ? null : edges.getLast().getCursor(),
                    isAfter,
                    likesPayload.size() > first);

            return new DefaultConnection<>(edges, pageInfo);
        });
    }
}
