package dev.huyhoangg.midia.domain.model.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import dev.huyhoangg.midia.dgraph.annotation.DgraphNode;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import dev.huyhoangg.midia.domain.model.DgraphBaseModel;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@DgraphNode
@ToString
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfile extends DgraphBaseModel {
    @DgraphPredicate("user_profile.full_name")
    private String fullName;

    @DgraphPredicate("user_profile.phone_number")
    private String phoneNumber;

    @DgraphPredicate("user_profile.dob")
    private LocalDate birthDate;

    @DgraphPredicate("user_profile.bio")
    private String bio;

    @DgraphPredicate("user_profile.avatar_url")
    private String avatarUrl;

    @DgraphPredicate("user_profile.gender")
    private String gender;
}
