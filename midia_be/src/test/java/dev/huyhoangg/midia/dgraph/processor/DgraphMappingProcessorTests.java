package dev.huyhoangg.midia.dgraph.processor;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import dev.huyhoangg.midia.domain.model.user.Role;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.infrastructure.config.JacksonConfig;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.Instant;
import java.util.Set;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(classes = {DgraphMappingProcessor.class, JacksonConfig.class})
class DgraphMappingProcessorTests {
    @Autowired
    ObjectMapper objectMapper;

    @Autowired
    DgraphMappingProcessor dgraphMappingProcessor;

    @Test
    void contextLoads() {
        assertNotNull(objectMapper);
        assertNotNull(dgraphMappingProcessor);
    }

    @Test
    void testMappingDgraphNodeToJson_Successful() throws JsonProcessingException {
        var now = Instant.now();
        var testUser = User.builder()
                .id("1")
                .username("test_user")
                .role(Role.builder().name("USER").build())
                .profile(UserProfile.builder().build())
                .createdAt(now)
                .updatedAt(now)
                .build();
        var actual = dgraphMappingProcessor.toDgraphNode(testUser);
        System.out.println(actual);
    }

    @Test
    void testMappingFromDgraphNode_Successful() throws JsonProcessingException {
        var now = Instant.now();
        var testUser =
                "{ \"dgraph.type\": [\"User\"], \"id\": \"1\", \"user.user_name\": \"test_user\", \"created_at\": \""
                        + now + "\", \"updated_at\": \"" + now + "\" }";
        var expected = User.builder()
                .id("1")
                .username("test_user")
                .createdAt(now)
                .updatedAt(now)
                .build();
        var actual = dgraphMappingProcessor.fromDgraphNode(testUser, User.class);

        assertEquals(expected.getId(), actual.getId());
        assertEquals(expected.getUsername(), actual.getUsername());
        assertEquals(expected.getCreatedAt(), actual.getCreatedAt());
        assertEquals(expected.getUpdatedAt(), actual.getUpdatedAt());
    }

    @Test
    void testMappingRelationshipDgraphNode_Successful() throws JsonProcessingException {
        var testUser = "{" + "\"dgraph.type\": [\"User\"], "
                + "\"id\": \"1\", "
                + "\"user.user_name\": \"test_user\", "
                + "\"user.followings\": ["
                + "{\"dgraph.type\": [\"User\"], \"id\": \"2\", \"user.user_name\": \"test_user_2\"}, "
                + "{\"dgraph.type\": [\"User\"], \"id\": \"3\", \"user.user_name\": \"test_user_3\"}"
                + "]"
                + "}";
        var expected = User.builder()
                .id("1")
                .username("test_user")
                .followings(Set.of(
                        User.builder().id("2").username("test_user_2").build(),
                        User.builder().id("3").username("test_user_3").build()))
                .build();
        var actual = dgraphMappingProcessor.fromDgraphNode(testUser, User.class);
        assertEquals(expected.getId(), actual.getId());
        assertEquals(expected.getUsername(), actual.getUsername());
        assertEquals(
                expected.getFollowings().stream().map(User::getId).collect(Collectors.toSet()),
                actual.getFollowings().stream().map(User::getId).collect(Collectors.toSet()));
    }
}
