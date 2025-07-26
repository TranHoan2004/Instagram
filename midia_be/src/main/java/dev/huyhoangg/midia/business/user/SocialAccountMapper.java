package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.model.user.SocialAccount;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface SocialAccountMapper {

    @Mapping(target = "linkedAt", source = "linkedAt", qualifiedByName = "instantToString")
    dev.huyhoangg.midia.codegen.types.SocialAccount toGraphQLSocialAccountType(SocialAccount socialAccount);

    List<dev.huyhoangg.midia.codegen.types.SocialAccount> toGraphQLSocialAccountTypes(List<SocialAccount> socialAccounts);

    @Named("instantToString")
    default String instantToString(Instant instant) {
        if (instant == null) {
            return null;
        }
        return instant.toString();
    }
}