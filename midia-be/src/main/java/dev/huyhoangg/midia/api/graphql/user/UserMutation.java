package dev.huyhoangg.midia.api.graphql.user;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import lombok.RequiredArgsConstructor;

@DgsComponent
@RequiredArgsConstructor
public class UserMutation {
    private final UserCommonService userCommonService;

    @DgsMutation
    public RegisterUserResp registerUser(@InputArgument RegisterUserInput input) {
        return userCommonService.registerUser(input);
    }
}
