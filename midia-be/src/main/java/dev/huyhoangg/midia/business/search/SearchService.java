package dev.huyhoangg.midia.business.search;

import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;

import java.util.List;

public interface SearchService {
    List<User> searchUserByKeyword(String kw);

    UserProfile getAvatarByUserUid(String uid);
}
