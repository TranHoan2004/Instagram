package dev.huyhoangg.midia.infrastructure.util;

import graphql.relay.*;

import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.function.Function;

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

    public static ConnectionCursor encodeOffset(Integer offset) {
        var encodedKey = Base64.getEncoder().encodeToString(offset.toString().getBytes());
        return new DefaultConnectionCursor(encodedKey);
    }

    public static Integer getOffsetFromConnectionCursor(String cursorValue) {
        var decodedKey = Base64.getDecoder().decode(cursorValue);
        return Integer.parseInt(new String(decodedKey));
    }

    public static String getCursorValueFromConnectionCursor(String cursorValue) {
        if (cursorValue == null) return null;

        var decodedKey = Base64.getDecoder().decode(cursorValue);
        return new String(decodedKey);
    }

    public static <T, R> Connection<R> buildConnectionForOffsetBased(
            List<T> elements, Integer first, Integer offset, Function<T, R> mappingFunction) {
        if (elements == null || elements.isEmpty()) {
            return new DefaultConnection<>(Collections.emptyList(),
                    new DefaultPageInfo(null, null, offset > 0, false));
        }

        var hasNextPage = elements.size() > first;
        var paginatedElements = hasNextPage ? elements.subList(0, first) : elements;
        List<Edge<R>> edges = new ArrayList<>();
        for (var i = 0; i < paginatedElements.size(); i++) {
            var mappingResult = mappingFunction.apply(paginatedElements.get(i));
            var cursor = ConnectionUtil.encodeOffset(offset + i + 1);
            edges.add(new DefaultEdge<>(mappingResult, cursor));
        }

        var startCursor = edges.isEmpty() ? null : edges.getFirst().getCursor();
        var endCursor = edges.isEmpty() ? null : edges.getLast().getCursor();

        var pageInfo = new DefaultPageInfo(startCursor, endCursor, offset > 0, hasNextPage);

        return new DefaultConnection<>(edges, pageInfo);
    }
}
