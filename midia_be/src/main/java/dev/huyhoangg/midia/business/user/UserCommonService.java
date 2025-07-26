package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.codegen.types.UpdatePasswordResp;
import dev.huyhoangg.midia.codegen.types.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;

import java.util.List;

public interface UserCommonService {

    dev.huyhoangg.midia.codegen.types.RegisterUserResp registerUser(
            dev.huyhoangg.midia.codegen.types.RegisterUserInput registerUserInput);

    dev.huyhoangg.midia.codegen.types.UserProfile getUserProfile(String userId);

    dev.huyhoangg.midia.codegen.types.User getMyInfo();

    String getCurrentUserUid();

    boolean verifyEmail(String token, String id);

    dev.huyhoangg.midia.codegen.types.User getUserById(String id);

    dev.huyhoangg.midia.codegen.types.User getUserByUsername(String username);

    dev.huyhoangg.midia.codegen.types.User getUserByEmail(String email);

    dev.huyhoangg.midia.codegen.types.User getUserByPost(dev.huyhoangg.midia.codegen.types.Post post);

    List<dev.huyhoangg.midia.domain.model.user.User> searchUserByKeyword(String kw);

    dev.huyhoangg.midia.codegen.types.UserProfile editUserProfile(String userId, UserProfile profile);
    UpdatePasswordResp updatePassword(dev.huyhoangg.midia.codegen.types.UpdatePasswordInput input);

    dev.huyhoangg.midia.domain.model.user.User editUserInformation(String id, String username, String email);

    graphql.relay.Connection<User> getUsersConnection(Integer first, String after);

    List<dev.huyhoangg.midia.codegen.types.SocialAccount> getSocialAccounts(String userUid);

    List<dev.huyhoangg.midia.codegen.types.SocialAccount> getSocialAccountsByUserId(String userId);

    dev.huyhoangg.midia.codegen.types.User editUserRole(String userId, String roleName);

    Boolean assignRoleToUsers(String roleName, List<String> userIds);

    dev.huyhoangg.midia.codegen.types.User toggleUserStatus(String userId);

    dev.huyhoangg.midia.codegen.types.User adminAddUser(dev.huyhoangg.midia.codegen.types.AdminAddUserInput input);

    List<dev.huyhoangg.midia.domain.model.user.User> getActiveUsers();
}
