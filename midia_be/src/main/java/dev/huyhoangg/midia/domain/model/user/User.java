package dev.huyhoangg.midia.domain.model.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.dgraph.annotation.Relationship;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import lombok.*;

import java.time.Instant;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class User extends DgraphBaseModel {
    @DgraphPredicate("id")
    private String id; // uuid

    @DgraphPredicate("user.user_name")
    private String username;

    @DgraphPredicate("user.profile")
    @Relationship(eagerFetch = true)
    private UserProfile profile;

    @DgraphPredicate("user.email")
    private String email;

    @DgraphPredicate("user.password")
    private String password;

    @DgraphPredicate("user.stats")
    @Relationship(eagerFetch = true)
    private UserStats stats;

    @DgraphPredicate("user.role")
    @Relationship(eagerFetch = true)
    private Role role;

    @DgraphPredicate("user.followings")
    @Relationship
    private Set<User> followings;

    @DgraphPredicate("user.followers")
    @Relationship
    private Set<User> followers;

    @DgraphPredicate("user.social_accounts")
    @Relationship
    private Set<SocialAccount> socialAccounts;

    @DgraphPredicate("user.is_locked")
    @Builder.Default
    private Boolean isLocked = false;

    @DgraphPredicate("user.is_email_verified")
    @Builder.Default
    private Boolean isEmailVerified = false;

    @DgraphPredicate("created_at")
    private Instant createdAt;

    @DgraphPredicate("updated_at")
    private Instant updatedAt;

    @DgraphPredicate("deleted_at")
    private Instant deletedAt;
}
