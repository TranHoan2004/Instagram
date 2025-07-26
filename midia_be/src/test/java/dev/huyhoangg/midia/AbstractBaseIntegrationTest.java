package dev.huyhoangg.midia;

import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.utility.DockerImageName;

import java.time.Duration;

@ActiveProfiles("test")
public abstract class AbstractBaseIntegrationTest {
    private static final DockerImageName DGRAPH_IMAGE = DockerImageName.parse("dgraph/standalone:v24.1.2");

    public static final GenericContainer<?> DGRAPH_CONTAINER = new GenericContainer<>(DGRAPH_IMAGE)
            .withExposedPorts(8080, 9080)
            .waitingFor(
                    Wait.forHttp("/health").forPort(8080).forStatusCode(200).withStartupTimeout(Duration.ofMinutes(2)));

    static {
        DGRAPH_CONTAINER.start();
    }

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("dgraph.host", DGRAPH_CONTAINER::getHost);
        registry.add("dgraph.port", () -> DGRAPH_CONTAINER.getMappedPort(9080));
    }
}
