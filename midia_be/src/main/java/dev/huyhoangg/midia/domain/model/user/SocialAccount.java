package dev.huyhoangg.midia.domain.model.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SocialAccount extends DgraphBaseModel {
    @DgraphPredicate("social_account.provider")
    private String provider;

    @DgraphPredicate("social_account.sub")
    private String sub;

    @DgraphPredicate("social_account.linked_at")
    private Instant linkedAt;
}
