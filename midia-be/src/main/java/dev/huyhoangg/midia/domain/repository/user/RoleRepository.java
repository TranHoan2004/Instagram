package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.Role;

import java.util.Optional;

public interface RoleRepository {
    Role save(Role role);

    Optional<Role> findByName(String name);

    void delete(String name);
}
