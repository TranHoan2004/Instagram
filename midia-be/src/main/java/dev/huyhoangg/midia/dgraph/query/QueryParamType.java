package dev.huyhoangg.midia.dgraph.query;

import lombok.Getter;

@Getter
public enum QueryParamType {
    STRING("string"),
    INT("int"),
    BOOLEAN("bool"),
    FLOAT("float"),
    DATETIME("dateTime"),
    UID("uid");

    QueryParamType(String value) {
        this.value = value;
    }

    private final String value;

}

