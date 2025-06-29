package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.UserProfile;

public interface UserProfileRepository {
    UserProfile save(UserProfile userProfile);
}
