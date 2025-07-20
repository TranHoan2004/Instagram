package dev.huyhoangg.midia.infrastructure.db.persistence;

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
import java.util.Optional;

@Repository
@RequiredArgsConstructor
@Slf4j
public class DgraphAttachmentRepository implements AttachmentRepository {
    private final DgraphMappingProcessor mappingProcessor;
    private final DgraphTemplate dgraphTemplate;

    @Override
    public Attachment save(Attachment attachment) {
        var uid = dgraphTemplate.executeMutation(txn -> {
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
                return response.getUidsMap().get(attachment.getId());
            }

            return attachment.getUid();
        });
        return findByUid(uid).orElseThrow();
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
} 