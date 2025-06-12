package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.User;

import java.util.Optional;

public interface UserRepository {
    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    Optional<User> findById(String id);

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    User save(User user);
}
