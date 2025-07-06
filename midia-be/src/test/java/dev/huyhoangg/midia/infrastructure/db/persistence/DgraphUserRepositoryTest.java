package dev.huyhoangg.midia.infrastructure.db.persistence;

import dev.huyhoangg.midia.AbstractBaseIntegrationTest;
import dev.huyhoangg.midia.cmd.MigrateSchemaRunner;
import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.infrastructure.config.JacksonConfig;
import dev.huyhoangg.midia.infrastructure.db.DgraphConfig;
import io.dgraph.DgraphClient;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = {
        DgraphTemplate.class,
        DgraphUserRepository.class,
        DgraphConfig.class,
        JacksonConfig.class,
        DgraphMappingProcessor.class
})
@Testcontainers
class DgraphUserRepositoryTest extends AbstractBaseIntegrationTest {

    @Autowired
    private DgraphUserRepository dgraphUserRepository;

    @BeforeAll
    static void setUp(@Autowired DgraphClient dgraphClient) throws Exception {
        MigrateSchemaRunner migrateSchemaRunner = new MigrateSchemaRunner(dgraphClient);
        migrateSchemaRunner.run("--migrate-schema");
    }

    @Test
    void existsByUsername() {
    }

    @Test
    void findById() {
    }

    @Test
    void save_success() {
        var testUser = User.builder()
                .id(UUID.randomUUID().toString())
                .username("testuser")
                .email("test@example.com")
                .password("password")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();
        var actual = dgraphUserRepository.save(testUser);
        Assertions.assertNotNull(actual);
        Assertions.assertEquals(testUser.getUsername(), actual.getUsername());
        Assertions.assertEquals(testUser.getEmail(), actual.getEmail());
    }
}