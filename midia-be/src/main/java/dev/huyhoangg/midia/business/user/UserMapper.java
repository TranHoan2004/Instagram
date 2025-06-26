package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.model.user.UserStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {
    @Mapping(target = "role", expression = "java(user.getRole().getName())")
    @Mapping(target = "followers", source = "followers")
    @Mapping(target = "followings", source = "followings")
    dev.huyhoangg.midia.codegen.types.User toGraphQLUserType(User user);

    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "role", ignore = true) // role mapping from string requires repository
    @Mapping(target = "followers", source = "followers")
    @Mapping(target = "followings", source = "followings")
    User toDomainUserType(dev.huyhoangg.midia.codegen.types.User user);

    @Mapping(target = "birthDate", source = "birthDate", qualifiedByName = "localDateToString")
    dev.huyhoangg.midia.codegen.types.UserProfile toGraphQLUserProfileType(UserProfile userProfile);

    @Mapping(target = "birthDate", source = "birthDate", qualifiedByName = "stringToLocalDate")
    UserProfile toDomainUserType(dev.huyhoangg.midia.codegen.types.UserProfile userProfile);

    List<dev.huyhoangg.midia.codegen.types.User> toGraphQLUserType(Set<User> users);

    Set<User> toDomainUserType(List<dev.huyhoangg.midia.codegen.types.User> users);

    dev.huyhoangg.midia.codegen.types.UserStats toGraphQLUserStatsType(UserStats userStats);

    @Named("localDateToString")
    default String localDateToString(LocalDate localDate) {
        return localDate == null ? null : localDate.toString();
    }

    @Named("stringToLocalDate")
    default String stringToLocalDate(String date) {
        return date == null ? null : LocalDate.parse(date).toString();
    }
}
