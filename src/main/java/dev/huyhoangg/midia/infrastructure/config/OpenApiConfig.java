package dev.huyhoangg.midia.infrastructure.config;

import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springdoc.core.utils.Constants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.autoconfigure.endpoint.web.WebEndpointProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Value("${springdoc.version}")
    private String version;

    @Bean
    public GroupedOpenApi actuatorApi(WebEndpointProperties webEndpointProperties) {
        return GroupedOpenApi.builder()
                .group("actuator")
                .addOpenApiCustomizer(openApi -> openApi.info(
                        new Info().title("Midia Actuator API").version(version).description("Actuator")
                ))
                .pathsToMatch(webEndpointProperties.getBasePath() + Constants.ALL_PATTERN)
                .build();
    }

    @Bean
    public GroupedOpenApi midiaApi() {
        return GroupedOpenApi.builder()
                .group("midia-rest")
                .addOpenApiCustomizer(openApi -> openApi.info(
                        new Info().title("Midia API").version(version).description("Midia RESTful API")
                ))
                .packagesToScan("dev.huyhoangg.midia.api.rest")
                .build();
    }
}
