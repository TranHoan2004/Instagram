package dev.huyhoangg.midia.domain.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
public abstract class DgraphBaseModel {
    @Getter
    @DgraphPredicate("uid")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private String uid;
    @DgraphPredicate("dgraph.type")
    private String[] dgraphType;

    public String[] getDgraphType() {
        return new String[]{getClass().getSimpleName()};
    }
}
