package dev.huyhoangg.midia.domain.model.notification;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
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

import java.time.Instant;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown=true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Notification extends DgraphBaseModel {
    @DgraphPredicate("id")
    private String id;

    @DgraphPredicate("notification.type")
    private String type;

    @DgraphPredicate("notification.recipient")
    @Relationship
    private User recipient;

    @DgraphPredicate("notification.actor")
    @Relationship
    private User actor;

    @DgraphPredicate("notification.post")
    @Relationship
    private Post post;

    @DgraphPredicate("notification.message")
    private String message;

    @DgraphPredicate("notification.is_read")
    @Builder.Default
    private boolean isRead = false;

    @DgraphPredicate("notification.created_at")
    private Instant createdAt;
}
