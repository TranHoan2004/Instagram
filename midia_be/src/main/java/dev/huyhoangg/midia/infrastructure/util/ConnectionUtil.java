package dev.huyhoangg.midia.infrastructure.util;

import graphql.relay.*;

import java.util.Base64;

public class ConnectionUtil {
    private ConnectionUtil() {}

    public static ConnectionCursor connectionCursor(String key) {
        var encodedKey = Base64.getEncoder().encodeToString(key.getBytes());
        return new DefaultConnectionCursor(encodedKey);
    }

    public static String getValueFromConnectionCursor(ConnectionCursor cursor) {
        var decodedKey = Base64.getDecoder().decode(cursor.getValue());
        return new String(decodedKey);
    }
}
