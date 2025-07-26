package dev.huyhoangg.midia.infrastructure.db.persistence;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.protobuf.ByteString;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.dgraph.query.QueryParamType;
import dev.huyhoangg.midia.dgraph.query.QueryParams;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.repository.attachment.AttachmentRepository;
import io.dgraph.DgraphProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphAttachmentRepository implements AttachmentRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public Attachment save(Attachment attachment) {
        var uid = dgraphTemplate.executeMutationWithRetry(txn -> {
            var isUpdate = attachment.getUid() != null && !attachment.getUid().isBlank();
            if (!isUpdate) {
                attachment.setUid("_:" + attachment.getId());
            }
            var jsonReq = mappingProcessor.toDgraphNode(attachment);
            log.info("jsonReq: {}", jsonReq);
            var mutation = DgraphProto.Mutation.newBuilder()
                    .setSetJson(ByteString.copyFromUtf8(jsonReq))
                    .build();
            var response = txn.mutate(mutation);
            txn.commit();
            if (!isUpdate) {
                var newUid = response.getUidsMap().get(attachment.getId());
                if (newUid == null || newUid.startsWith("_:")) {
                    log.error("Dgraph did not return a real uid for attachment id: {}, got: {}", attachment.getId(), newUid);
                    throw new RuntimeException("Failed to create attachment: Dgraph did not return a real uid");
                }
                return newUid;
            }
            return attachment.getUid();
        });
        return findByUid(uid).orElseThrow(() -> new RuntimeException("Attachment not found after creation, uid: " + uid));
    }

    @Override
    public Optional<Attachment> findById(String id) {
        var query = QueryBuilder.builder()
                .queryName("find_attachment_by_id")
                .queryParams(new QueryParams("$id", QueryParamType.STRING))
                .forType(Attachment.class)
                .filterEquals("id", "$id")
                .limit(1)
                .build();

        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var vars = Collections.singletonMap("$id", id);
            var response = txn.queryWithVars(query, vars);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Attachment.class);
            return result.iterator().next();
        });
    }

    @Override
    public List<Attachment> findByPostId(String postId) {
        var query = """
                query find_attachment_by_post_id($post_id: string) {
                    var(func: type(Post)) @filter(eq(id, $post_id)) {
                        post.attachments {
                            attachmentId as uid
                        }
                    }
                
                    q(func: uid(attachmentId)) @filter(type(Attachment)) {
                        uid
                        dgraph.type
                        expand(_all_)
                    }
                }
                """;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = Collections.singletonMap("$post_id", postId);
            var response = txn.queryWithVars(query, vars);
            var result = objectMapper.readTree(response.getJson().toStringUtf8()).get("q").toString();
            return objectMapper.readValue(result, new TypeReference<>() {});
        });
    }

    @Override
    public void deleteById(String id) {
        Attachment attachment = findById(id).orElseThrow(() -> new RuntimeException("Attachment not found"));
        attachment.setDeletedAt(Instant.now());
        save(attachment);
    }

    public Optional<Attachment> findByUid(String uid) {
        var query = """
                {
                    q(func: uid(%s)) @filter(type(Attachment)) {
                        uid
                        dgraph.type
                        expand(_all_)
                    }
                }
                """;
        return dgraphTemplate.executeReadOnlyQueryReturnOptional(txn -> {
            var response = txn.query(String.format(query, uid));
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Attachment.class);
            return result.iterator().next();
        });
    }

    public java.util.List<Attachment> findAll() {
        var query = QueryBuilder.builder()
                .queryName("find_all_attachments")
                .forType(Attachment.class)
                .build();

        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var response = txn.query(query);
            var result = mappingProcessor.fromDefaultQueryResponse(response.getJson().toStringUtf8(), Attachment.class);
            return new java.util.ArrayList<>(result);
        });
    }
}