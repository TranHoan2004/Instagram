package dev.huyhoangg.midia.domain.model.user;

import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import java.time.Instant;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DgraphNode
public class SocialAccount extends DgraphBaseModel {
    @DgraphPredicate("social_account.provider")
    private String provider;

    @DgraphPredicate("social_account.sub")
    private String sub;

    @DgraphPredicate("social_account.linked_at")
    private Instant linkedAt;
}
