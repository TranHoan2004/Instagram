package dev.huyhoangg.midia.domain.model.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserStats extends DgraphBaseModel {
    @DgraphPredicate("user_stats.total_posts")
    @Builder.Default
    private Long totalPosts = 0L;

    @DgraphPredicate("user_stats.total_followers")
    @Builder.Default
    private Long totalFollowers = 0L;

    @DgraphPredicate("user_stats.total_followings")
    @Builder.Default
    private Long totalFollowings = 0L;
}
