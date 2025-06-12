## Document Endpoint
- For Graphql: /graphiql
- For RESTful: /swagger-ui/index.html 

## Run Docker infrastructure

```bash
docker-compose -f docker-compose.dev.yml up -d
```

To run a specific container from docker-compose file use

`docker-compose -f docker-compose.dev.yml up -d <container_name>`

e.g:
```bash
docker-compose -f docker-compose.dev.yml up -d dgraph
```

## Stop Docker infrastructure

```bash
docker-compose -f docker-compose.dev.yml down
```

### Annotation Notes:

- `@DgraphNode` is used to mark a class as a Dgraph node.
- `@DgraphPredicate` is used to mark a field as a Dgraph predicate. Need to specify the correct predicate name in Dgraph
  schema. Dgraph will automatically generate the predicate name based on the request but we should define the predicate 
  in the schema first.
- `@Relationship` is used to mark a field as a relationship. eagerFetch will tell DgraphQueryBuilder to include 
  all fields of that node in the query.

## QueryBuilder:

```java
var query = QueryBuilder.builder()
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
// Equivalent to:
// query test($email: string, $total_posts: int) {
//  q(func: type(User), first: 1, offset: 0) @filter(eq(user_credential.email, $email) AND gt(user_stats.total_posts, $total_posts)) {
//      uid
//      id
//      user.user_name
//      ...remaining predicates
//      }
//  }
```
- queryName(String queryName): name of the outside query wrapper, Can be omitted
- queryParams(QueryParams... queryParams): define the query parameters, Can be omitted (alias must start with "$")
- forType(Class<?> type): define the type of the node in the response
- filter****(String predicate, String alias): add a filter for specific predicate to the query
- limit(int limit): set the number of results in the response for the query
- offset(int offset): like SQL offset