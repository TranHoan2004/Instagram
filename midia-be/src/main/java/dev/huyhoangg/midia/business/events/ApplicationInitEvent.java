package dev.huyhoangg.midia.business.events;

import dev.huyhoangg.midia.domain.model.user.Permission;
import dev.huyhoangg.midia.domain.model.user.Role;
import dev.huyhoangg.midia.domain.repository.user.PermissionRepository;
import dev.huyhoangg.midia.domain.repository.user.RoleRepository;
import dev.huyhoangg.midia.domain.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashSet;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
public class ApplicationInitEvent {
    private boolean initialized = false;
    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    static final Set<Permission> BASIC_PERMISSIONS = Set.of(
            new Permission("POST_READ"),
            new Permission("POST_WRITE"),
            new Permission("POST_UPDATE"),
            new Permission("POST_DELETE"),
            new Permission("POST_PUBLISH"),
            new Permission("POST_UNPUBLISH"),
            new Permission("POST_COMMENT"),
            new Permission("POST_REACT"),
            new Permission("COMMENT_READ"),
            new Permission("COMMENT_WRITE"),
            new Permission("COMMENT_UPDATE"),
            new Permission("COMMENT_DELETE"),
            new Permission("COMMENT_REACT")
    );

    static Set<Permission> ADMIN_PERMISSIONS = new HashSet<>();

    static {
        ADMIN_PERMISSIONS.addAll(BASIC_PERMISSIONS);
        ADMIN_PERMISSIONS.add(new Permission("USER_LIST"));
        ADMIN_PERMISSIONS.add(new Permission("USER_CREATE"));
        ADMIN_PERMISSIONS.add(new Permission("USER_UPDATE"));
        ADMIN_PERMISSIONS.add(new Permission("USER_DELETE"));
    }

    @Bean
    @ConditionalOnProperty(
            name = {"dgraph.address", "dgraph.port"}
    )
    public ApplicationRunner init() {
        return args -> {
            if (!args.containsOption("--bootstrap")) {
                return;
            }
            if (initialized) {
                return;
            }
            Set<Permission> userPermissions = BASIC_PERMISSIONS;
            userPermissions = (Set<Permission>) permissionRepository.saveAll(userPermissions);

            var role = new Role();
            role.setName("USER");
            role.setPermissions(userPermissions);
            roleRepository.save(role);
            initialized = true;
        };
    }
}
