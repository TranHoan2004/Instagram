package dev.huyhoangg.midia.dgraph.query;

import dev.huyhoangg.midia.domain.model.user.User;
import org.junit.jupiter.api.Test;

class QueryBuilderTest {

    @Test
    void testBuildQuery_Success() {
        var actual = QueryBuilder.builder()
                .queryName("test")
                .queryParams(
                        new QueryParams("$email", QueryParamType.STRING),
                        new QueryParams("$total_posts", QueryParamType.INT)
                )
                .forType(User.class)
                .filterEquals("user_credential.email", "$email")
                .filterGreaterThan("user_stats.total_posts", "$total_posts")
                .limit(1)
                .offset(0)
                .build();
        System.out.println(actual);
    }

    @Test
    void testBuildFetchUidOnlyQuery_Success() {
        var actual = QueryBuilder.builder()
                .queryName("test")
                .queryParams(
                        new QueryParams("$email", QueryParamType.STRING),
                        new QueryParams("$total_posts", QueryParamType.INT)
                )
                .forType(User.class)
                .filterEquals("user_credential.email", "$email")
                .filterGreaterThan("user_stats.total_posts", "$total_posts")
                .limit(1)
                .offset(0)
                .fetchUidOnly(true)
                .build();
        System.out.println(actual);
    }
}
