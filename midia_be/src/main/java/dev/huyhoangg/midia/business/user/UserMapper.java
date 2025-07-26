package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.model.user.UserStats;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;

import org.mapstruct.*;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE, unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    @Mapping(target = "role", expression = "java(user.getRole() != null ? user.getRole().getName() : null)")
    @Mapping(target = "followers", ignore = true)
    @Mapping(target = "followings", ignore = true)
    @Mapping(target = "posts", ignore = true)
    dev.huyhoangg.midia.codegen.types.User toGraphQLUserType(User user);

    @Mapping(target = "birthDate", source = "birthDate", qualifiedByName = "localDateToString")
    dev.huyhoangg.midia.codegen.types.UserProfile toGraphQLUserProfileType(UserProfile userProfile);

    dev.huyhoangg.midia.codegen.types.UserStats toGraphQLUserStatsType(UserStats userStats);

    default Connection<dev.huyhoangg.midia.codegen.types.User> toUserConnection(Connection<User> connection) {
        List<Edge<dev.huyhoangg.midia.codegen.types.User>> edges = connection.getEdges().stream()
                .map(edge -> new DefaultEdge<>(
                        toGraphQLUserType(edge.getNode()),
                        edge.getCursor()))
                .collect(Collectors.toList());

        return new DefaultConnection<>(edges, connection.getPageInfo());
    }

    @Named("localDateToString")
    default String localDateToString(LocalDate localDate) {
        return localDate == null ? null : localDate.toString();
    }
}
