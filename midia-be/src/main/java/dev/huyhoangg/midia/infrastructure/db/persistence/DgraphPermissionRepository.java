package dev.huyhoangg.midia.infrastructure.db.persistence;

import dev.huyhoangg.midia.domain.model.user.Permission;
import dev.huyhoangg.midia.domain.repository.user.PermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;
import java.util.Set;

@Repository
@RequiredArgsConstructor
public class DgraphPermissionRepository implements PermissionRepository {
    private final DgraphTemplate dgraphTemplate;

    @Override
    public Permission save(Permission permission) {
        return null;
    }

    @Override
    public Optional<Permission> findByAction(String action) {
        return Optional.empty();
    }

    @Override
    public Set<Permission> findAllByActions(Collection<String> actions) {
        return Set.of();
    }

    @Override
    public Collection<Permission> findAllByRoleName(String roleName) {
        return Set.of();
    }

    @Override
    public void delete(String action) {

    }

    @Override
    public Collection<Permission> saveAll(Collection<Permission> permissions) {
        return Set.of();
    }
}
