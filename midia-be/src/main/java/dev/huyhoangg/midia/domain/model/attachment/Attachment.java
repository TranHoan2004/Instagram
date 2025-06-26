package dev.huyhoangg.midia.domain.model.attachment;
import lombok.*;

import java.time.Instant;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
public class Attachment extends DgraphBaseModel {
    @DgraphPredicate("id")
    private String id;
    
    @DgraphPredicate("attachment.title")
    private String title;
    
    @DgraphPredicate("attachment.description")
    private String description;
    
    @DgraphPredicate("attachment.original_link")
    private String originalLink;
    
    @DgraphPredicate("attachment.optimized_links")
    private Set<String> optimizedLinks;
    
    @DgraphPredicate("created_at")
    private Instant createdAt;
    
    @DgraphPredicate("updated_at")
    private Instant updatedAt;
    
    @DgraphPredicate("deleted_at")
    private Instant deletedAt;
}
