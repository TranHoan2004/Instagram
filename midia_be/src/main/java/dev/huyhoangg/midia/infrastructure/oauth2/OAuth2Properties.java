package dev.huyhoangg.midia.infrastructure.oauth2;

import lombok.Getter;
import lombok.Setter;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "oauth2-login")
@Getter
@Setter
public class OAuth2Properties {
    private List<String> redirectUris;
}
