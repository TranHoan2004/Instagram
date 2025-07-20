package dev.huyhoangg.midia.infrastructure.db.persistence;

import dev.huyhoangg.midia.AbstractBaseIntegrationTest;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.domain.model.user.Role;
import dev.huyhoangg.midia.infrastructure.config.JacksonConfig;
import dev.huyhoangg.midia.infrastructure.db.DgraphConfig;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

@SpringBootTest(classes = {
        DgraphConfig.class,
        DgraphRoleRepository.class,
        DgraphTemplate.class,
        JacksonConfig.class,
        DgraphMappingProcessor.class,
})
@Testcontainers
class DgraphRoleRepositoryTest extends AbstractBaseIntegrationTest {

    @Autowired
    DgraphRoleRepository dgraphRoleRepository;

    @Test
    void contextLoads() {
        Assertions.assertNotNull(dgraphRoleRepository);
    }

    @Test
    void findByName_notFound() {
        Optional<Role> result = dgraphRoleRepository.findByName("NOT_FOUND");
        Assertions.assertTrue(result.isEmpty());
    }

    @Test
    void findByName_found() {
        var role = Role.builder().name("USER").build();
        dgraphRoleRepository.save(role);
        var result = dgraphRoleRepository.findByName("USER");
        Assertions.assertTrue(result.isPresent());
        Assertions.assertEquals("USER", result.get().getName());
        dgraphRoleRepository.delete("USER");
        Assertions.assertTrue(dgraphRoleRepository.findByName("USER").isEmpty());
    }
}