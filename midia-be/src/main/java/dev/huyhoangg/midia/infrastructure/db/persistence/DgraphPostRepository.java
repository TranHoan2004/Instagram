package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.repository.post.PostRepository;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphPostRepository implements PostRepository {

    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Post save(Post post) {
        dgraphTemplate.executeMutation(txn -> {
            var jsonReq = mappingProcessor.toDgraphNode(post);
            log.info("jsonReq: {}", jsonReq);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            txn.mutate(mutation);
            txn.commit();
        });
        return post;
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
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Post.class);
            return result.iterator().next();
        });
    }

    @Override
    public List<Post> findByAuthorId(String authorId) {
        var query = QueryBuilder.builder()
                .queryName("find_posts_by_author")
                .queryParams(new QueryParams("$authorId", QueryParamType.STRING))
                .forType(Post.class)
                .filterEquals("author", "$authorId")
                .build();

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = Collections.singletonMap("$authorId", authorId);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Post.class);
            return (List<Post>) result;
        });
    }

    @Override
    public void deleteById(String id) {
        Post post = findById(id).orElseThrow(() -> new RuntimeException("Post not found"));
        post.setDeletedAt(Instant.now());
        save(post);
    }
} 