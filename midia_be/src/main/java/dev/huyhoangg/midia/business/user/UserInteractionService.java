package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.model.user.User;

public interface UserInteractionService {

    boolean toggleFollow(String currentUserId, String targetUserId);

    boolean toggleBlock(String currentUserId, String targetUserId);
}
