package dev.huyhoangg.midia.infrastructure.db.persistence;

import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.dgraph.query.QueryBuilder;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.repository.user.SearchUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;

/**
 * <h4>Dgraph Search User Repository</h4>
 * <p>
 * This class implements the {@link SearchUserRepository} interface to provide Dgraph-specific
 * search functionality for {@link User} entities. It supports keyword-based user searching
 * by either username (Dgraph query with RegExp) or full name inside the user's profile (filtered in memory).
 * </p>
 *
 * <h4>Features:</h4>
 * <ul>
 *     <li>Search users by partial or fuzzy username using Dgraph RegExp filter.</li>
 *     <li>Search users by full name from their profile (non-indexed field, filtered manually).</li>
 *     <li>Query building is done dynamically using {@code QueryBuilder} utility.</li>
 *     <li>Mapping is handled via {@code DgraphMappingProcessor} and {@code DgraphTemplate}.</li>
 * </ul>
 */
@Slf4j
@Repository
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DgraphSearchUserRepository implements SearchUserRepository {
    DgraphMappingProcessor mp;
    DgraphTemplate template;

    /**
     * <h4>Finds a list of users whose usernames partially match the given keyword.</h4>
     * <p>
     * This method constructs a Dgraph query using a RegExp filter on the {@code user.user_name} predicate.
     * The keyword will be matched against usernames using a case-insensitive regex.
     * </p>
     *
     * <h4>Example Dgraph query:</h4>
     * <pre>{@code
     * {
     *   findUser(func: type(User)) @filter(regexp(user.user_name, /<kw>/)) {
     *     uid
     *     user.user_name
     *   }
     * }
     * }</pre>
     *
     * @param kw the keyword to search for in usernames.
     * @return a list of {@link User} entities whose usernames contain the keyword.
     * @author HoanTX
     */
    @Override
    public List<User> findUserByUserNameContaining(String kw) {
        log.info("findUserByUserNameContaining");

        var query = QueryBuilder.builder()
                .queryName("user_containing_keyword")
                .forType(User.class)
                .filterRegexp("user.user_name", kw)
                .build();

        return getUsersList(query);
    }

    @Override
    public List<User> findUserByProfileFullNameContaining(String kw) {
        log.info("findUserByProfileFullNameContaining");

        var query =
                """
                {
                  q(func: type(User)) @cascade {
                    uid
                    dgraph.type
                    id
                    user.user_name
                    user.email
                    user.profile @filter(regexp(user_profile.full_name, /%s/)) {
                        user_profile.avatar_url
                    }
                  }
                }
                """
                        .formatted(kw);

        return getUsersList(query);
    }

    private List<User> getUsersList(String query) {
        return template.executeReadOnlyQuery(txn -> {
            var response = txn.query(query);
            log.info("response: \n{}", response.getJson().toStringUtf8());
            return new ArrayList<>(
                    mp.fromDefaultQueryResponse(response.getJson().toStringUtf8(), User.class));
        });
    }
}
