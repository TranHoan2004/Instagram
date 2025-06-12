package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.codegen.types.UserProfile;

public interface UserCommonService {

    RegisterUserResp registerUser(RegisterUserInput registerUserInput);

    UserProfile getUserProfile(String userId);

    User getMyInfo();
}
