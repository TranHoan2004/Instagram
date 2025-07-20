package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;

import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.repository.SortDirection;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import dev.huyhoangg.midia.infrastructure.util.ConnectionUtil;
import graphql.relay.*;
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
public class DgraphPostRepository implements PostRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objectMapper;

    private static final Integer DEFAULT_UNLIMITED = 1000;
    private static final String FIND_POST_BY_AUTHOR_ID_ORDER_BY_CREATED_AT =
           """
           query find_posts_by_author_order_by_created_at($authorId: string, $first: int = 1000, $after: string) {
                q(func: type(User)) @filter(eq(id, $authorId)) {
                    posts : user.posts(orderdesc: created_at, first: $first)
                    @filter(lt(created_at, $after))
                    {
                        uid
                        expand(_all_)
                    }
                }
           }
           """;

    @Override
    public Post save(Post post) {
        var isUpdate = post.getUid() != null && !post.getUid().isBlank();
        if (!isUpdate) {
            post.setUid("_:" + post.getId());
        }
        return dgraphTemplate.executeMutation(txn -> {
            var jsonReq = mappingProcessor.toDgraphNode(post);
            log.info("jsonReq: {}", jsonReq);
            var createPost = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            var createUserPostRelationship = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(String.format("""
                            {
                                "uid": "%s",
                                "user.posts": [
                                    {
                                        "uid": "%s"
                                    }
                                ]
                            }
                            """, post.getAuthor().getUid(), post.getUid())))
                    .build();
            var request = DgraphProto.Request.newBuilder()
                    .addMutations(0, createPost)
                    .addMutations(1, createUserPostRelationship)
                    .setCommitNow(true)
                    .build();
            var response = txn.doRequest(request);
            if (!isUpdate) {
                var uid = response.getUidsMap().get(post.getId());
                post.setUid(uid);
            }
            return post;
        });
    }

    @Override
    public Optional<Post> findById(String id) {
        var query = QueryBuilder.builder()
                .queryName("find_post_by_id")
                .queryParams(new QueryParams("$id", QueryParamType.STRING))
                .forType(Post.class)
                .filterEquals("id", "$id")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$id", id);
            var response = txn.queryWithVars(query, vars);
            var result =
                    mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Post.class);
            return result.iterator().next();
        });
    }

    @Override
    public Connection<Post> findByAuthorIdOrderByCreatedAt(
            String authorId, Integer first, String after, SortDirection sortDirection) {
        var query = FIND_POST_BY_AUTHOR_ID_ORDER_BY_CREATED_AT;
        var isSortAsc = sortDirection == SortDirection.ASC;
        if (isSortAsc) {
            query = query.replace("orderdesc", "orderasc");
            query = query.replace("@filter(lt(created_at, $after))", "@filter(gt(created_at, $after))");
        }
        var isAfter = after != null && !after.isBlank();
        if (!isAfter) {
            query = query.replace("@filter(lt(created_at, $after))", "");
        }

        var finalQuery = query;
        var finalFirst = first == null ? DEFAULT_UNLIMITED + 1 : first + 1;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$authorId", authorId);
            vars.put("$first", String.valueOf(finalFirst));
            if (isAfter) {
                vars.put("$after", ConnectionUtil.getValueFromConnectionCursor(new DefaultConnectionCursor(after)));
            }
            log.info("query: {}", finalQuery);

            var response = txn.queryWithVars(finalQuery, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var postPayload = json.get("q").get(0).get("posts");
            var posts = objectMapper.readValue(postPayload.toString(), new TypeReference<List<Post>>() {});

            log.info("posts: {}", posts);
            List<Edge<Post>> edges = posts.stream()
                    .map(post -> {
                        var cursor = ConnectionUtil.connectionCursor(
                                post.getCreatedAt().toString());
                        return new DefaultEdge<>(post, cursor);
                    })
                    .collect(Collectors.toList());

            edges.removeLast(); // remove the extra element in final result

            // hasPreviousPage is false when the first page is fetched
            // We fetch one extra element, if the number of elements in result is greater than the required limit
            // then hasNextPage is true
            var pageInfo = new DefaultPageInfo(
                    edges.getFirst().getCursor(), edges.getLast().getCursor(), isAfter, posts.size() > finalFirst - 1);

            return new DefaultConnection<>(edges, pageInfo);
        });
    }

    @Override
    public void deleteById(String id) {
        Post post = findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setDeletedAt(Instant.now());
        save(post);
    }
}
