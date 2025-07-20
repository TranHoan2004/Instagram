package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.Permission;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

public interface PermissionRepository {
    Permission save(Permission permission);

    Set<Permission> findAll();

    Optional<Permission> findByAction(String action);

    Set<Permission> findAllByActions(Collection<String> actions);

    Collection<Permission> findAllByRoleName(String roleName);

    void delete(String action);

    Collection<Permission> saveAll(Collection<Permission> permissions);
}
