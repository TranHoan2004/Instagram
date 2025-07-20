package dev.huyhoangg.midia.domain.repository.user;

import dev.huyhoangg.midia.domain.model.user.User;

import java.util.List;

public interface SearchUserRepository {
    List<User> findUserByUserNameContaining(String kw);

    List<User> findUserByProfileFullNameContaining(String kw);
}
