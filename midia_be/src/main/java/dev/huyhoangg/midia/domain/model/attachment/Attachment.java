package dev.huyhoangg.midia.domain.model.attachment;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.dgraph.annotation.Relationship;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import dev.huyhoangg.midia.domain.model.user.User;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Attachment extends DgraphBaseModel {
    @DgraphPredicate("id")
    private String id;

    @DgraphPredicate("attachment.created_by")
    @Relationship
    private User createdBy;

    @DgraphPredicate("attachment.type")
    private AttachmentType type;

    @DgraphPredicate("attachment.original_link")
    private String originalLink;

    @DgraphPredicate("attachment.optimized_links")
    private String optimizedLinks;

    @DgraphPredicate("created_at")
    private Instant createdAt;

    @DgraphPredicate("updated_at")
    private Instant updatedAt;

    @DgraphPredicate("deleted_at")
    private Instant deletedAt;
}
