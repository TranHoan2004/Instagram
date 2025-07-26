package dev.huyhoangg.midia.business.user;

import graphql.relay.Connection;

public interface UserInteractionService {
    boolean toggleFollow(String currentUserId, String targetUserId);

    boolean toggleBlock(String currentUserId, String targetUserId);

    Connection<dev.huyhoangg.midia.codegen.types.User> suggestUsers(String userId, Integer first, Integer offset);
}
