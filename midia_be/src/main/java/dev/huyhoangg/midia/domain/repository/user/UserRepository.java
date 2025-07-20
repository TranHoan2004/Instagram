package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.SocialAccount;
import dev.huyhoangg.midia.domain.model.user.User;

import java.util.Collection;
import java.util.Optional;

public interface UserRepository {
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    Optional<User> findUserByUid(String uid);

    User save(User user);

    Collection<SocialAccount> findSocialAccountsByUserUid(String uid);

    Optional<User> findByPostId(String postId);
}
