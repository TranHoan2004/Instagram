package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.EditUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@DgsComponent
@RequiredArgsConstructor
public class UserMutation {
    private final UserCommonService userCommonService;

    @DgsMutation
    public RegisterUserResp registerUser(@InputArgument RegisterUserInput input) {
        return userCommonService.registerUser(input);
    }

    @DgsMutation
    public dev.huyhoangg.midia.codegen.types.UserProfile editUserProfile(@InputArgument EditUserInput input) {
        dev.huyhoangg.midia.codegen.types.UserProfile p = userCommonService.editUserProfile(input.getUserId(), UserProfile.builder()
                .bio(input.getBio())
                .avatarUrl(input.getAvatarUrl())
                .phoneNumber(input.getPhoneNumber())
                .fullName(input.getFullName())
                .gender(input.getGender())
                .build());

        User u = userCommonService.editUserInformation(input.getUserId(), input.getUsername(), input.getEmail());
        return dev.huyhoangg.midia.codegen.types.UserProfile.newBuilder()
                .bio(p.getBio())
                .avatarUrl(p.getAvatarUrl())
                .birthDate(p.getBirthDate())
                .fullName(p.getFullName())
                .phoneNumber(p.getPhoneNumber())
                .username(u.getUsername())
                .build();
    }
}
