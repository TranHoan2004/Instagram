package dev.huyhoangg.midia.domain.model.post;
import java.time.Instant;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.dgraph.annotation.Relationship;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@Builder
@ToString
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
public class Post extends DgraphBaseModel {
    @DgraphPredicate("id")
    private String id; 

    @DgraphPredicate("post.caption")
    private String caption;

    @DgraphPredicate("created_at")
    private Instant createdAt;

    @DgraphPredicate("post.visibility")
    private PostVisibility visibility;
    
    @DgraphPredicate("deleted_at")
    private Instant deletedAt;
    @DgraphPredicate("updated_at")
    private Instant updatedAt;
    @DgraphPredicate("author")
    @Relationship(eagerFetch = true)
    private User author;
    
    @DgraphPredicate("attachments")
    @Relationship
    private Set<Attachment> attachments;
}
