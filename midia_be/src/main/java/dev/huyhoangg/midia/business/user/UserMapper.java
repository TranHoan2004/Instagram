package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.model.user.UserStats;
import org.mapstruct.*;

import java.time.LocalDate;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE
)
public interface UserMapper {
    @Mapping(target = "role", expression = "java(user.getRole().getName())")
    @Mapping(target = "followers", ignore = true)
    @Mapping(target = "followings", ignore = true)
    @Mapping(target = "posts", ignore = true)
    dev.huyhoangg.midia.codegen.types.User toGraphQLUserType(User user);

    @Mapping(target = "birthDate", source = "birthDate", qualifiedByName = "localDateToString")
    dev.huyhoangg.midia.codegen.types.UserProfile toGraphQLUserProfileType(UserProfile userProfile);

    dev.huyhoangg.midia.codegen.types.UserStats toGraphQLUserStatsType(UserStats userStats);

    @Named("localDateToString")
    default String localDateToString(LocalDate localDate) {
        return localDate == null ? null : localDate.toString();
    }
}
