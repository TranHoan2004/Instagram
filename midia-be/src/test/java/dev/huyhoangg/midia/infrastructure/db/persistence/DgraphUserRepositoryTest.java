package dev.huyhoangg.midia.infrastructure.db.persistence;

import dev.huyhoangg.midia.dgraph.processor.DgraphMappingProcessor;
import dev.huyhoangg.midia.infrastructure.config.JacksonConfig;
import dev.huyhoangg.midia.infrastructure.db.DgraphConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = {
        DgraphTemplate.class,
        DgraphUserRepository.class,
        DgraphConfig.class,
        JacksonConfig.class,
        DgraphMappingProcessor.class
})
class DgraphUserRepositoryTest {

    @Test
    void existsByUsername() {
    }

    @Test
    void findById() {
    }
}