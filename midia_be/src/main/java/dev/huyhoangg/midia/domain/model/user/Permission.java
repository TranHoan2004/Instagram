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
public class Permission extends DgraphBaseModel {
    @DgraphPredicate("permission.action")
    private String action;
}
