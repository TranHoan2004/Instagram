package dev.huyhoangg.midia.domain.model.post;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.dgraph.annotation.Relationship;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import dev.huyhoangg.midia.domain.model.comment.Comment;
import dev.huyhoangg.midia.domain.model.user.User;
import lombok.*;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
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

    @DgraphPredicate("post.author")
    @Relationship(eagerFetch = true)
    private User author;

    @DgraphPredicate("post.attachments")
    @Relationship
    private Set<Attachment> attachments;

    @DgraphPredicate("post.comments")
    @Relationship
    private Set<Comment> comments;

    @DgraphPredicate("post.total_likes")
    @Builder.Default
    private Long totalLikes = 0L;

    @DgraphPredicate("post.total_comments")
    @Builder.Default
    private Long totalComments = 0L;
}
