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

    String getCurrentUserUid();

    boolean verifyEmail(String token, String id);

    User getUserById(String id);

    User getUserByUsername(String username);

    User getUserByEmail(String email);

    List<dev.huyhoangg.midia.domain.model.user.User> searchUserByKeyword(String kw);

    UserProfile editUserProfile(String userId, dev.huyhoangg.midia.domain.model.user.UserProfile profile);

    dev.huyhoangg.midia.domain.model.user.User editUserInformation(String id, String username, String email);
}
