package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.SocialAccount;
import dev.huyhoangg.midia.domain.model.user.User;

import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findUserByUid(String uid);

    User save(User user);

    void updatePassword(String userId, String newPassword);

    Collection<SocialAccount> findSocialAccountsByUserUid(String uid);

    Optional<User> findByPostId(String postId);

    graphql.relay.Connection<dev.huyhoangg.midia.codegen.types.User> findAllPaginated(Integer first, String after);

    List<User> suggestUsers(String userId, Integer first, Integer offset);

    List<User> findUsersOrderByTotalFollowersExceptUser(String userId, Integer first, Integer offset);

    List<User> findAllUsersHasLastLoginAtAfter(Instant instant);

    void setLoginAt(String userId, Instant instant);

    Optional<User> findByIdWithFollowers(String id);
}
