package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.codegen.types.RegisterUserInput;
import dev.huyhoangg.midia.codegen.types.RegisterUserResp;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.codegen.types.UserProfile;

import java.util.List;

public interface UserCommonService {

    RegisterUserResp registerUser(RegisterUserInput registerUserInput);

    UserProfile getUserProfile(String userId);

    User getMyInfo();

    boolean verifyEmail(String token, String id);

    User getUserById(String id);

    User getUserByUsername(String username);

    User getUserByEmail(String email);

    List<dev.huyhoangg.midia.domain.model.user.User> searchUserByKeyword(String kw);

    void editUserProfile(String userId, dev.huyhoangg.midia.domain.model.user.UserProfile profile);

    void editUserInformation(String id, String username, String email);
}
