package dev.huyhoangg.midia.domain.model.comment;


import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.dgraph.annotation.Relationship;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.user.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.Instant;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Comment extends DgraphBaseModel {
    @DgraphPredicate("id")
    private String id;

    @DgraphPredicate("comment.content")
    private String content;

    @DgraphPredicate("comment.author")
    @Relationship(eagerFetch = true)
    private User author;

    @DgraphPredicate("created_at")
    private Instant createdAt;

    @DgraphPredicate("updated_at")
    private Instant updatedAt;

    @DgraphPredicate("deleted_at")
    private Instant deletedAt;

    @DgraphPredicate("comment.parent")
    @Relationship
    private Comment parent;

    @DgraphPredicate("comment.post")
    @Relationship
    private Post post;

    @DgraphPredicate("comment.total_likes")
    @Builder.Default
    private Long totalLikes = 0L;

    @DgraphPredicate("comment.liked_by")
    @Relationship
    private List<User> likedBy;
}