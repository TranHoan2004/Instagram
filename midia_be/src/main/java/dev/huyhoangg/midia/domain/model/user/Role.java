package dev.huyhoangg.midia.domain.model.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.dgraph.annotation.Relationship;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@DgraphNode
@JsonIgnoreProperties(ignoreUnknown = true)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Role extends DgraphBaseModel {
    @DgraphPredicate("role.name")
    private String name;

    @DgraphPredicate("role.permissions")
    @Relationship
    private Set<Permission> permissions;
}
