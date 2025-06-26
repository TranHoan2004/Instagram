package dev.huyhoangg.midia.business.search;

import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.domain.model.user.UserProfile;
import dev.huyhoangg.midia.domain.repository.user.SearchUserRepository;
import dev.huyhoangg.midia.domain.repository.user.UserProfileRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import java.util.List;

@Lazy
@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchServiceImpl implements SearchService {
    SearchUserRepository suRepo;
    UserProfileRepository upRepo;

    @Override
    public List<User> searchUserByKeyword(String kw) {
        log.info("searchUserByKeyword");
        List<User> list = suRepo.findUserByUserNameContaining(kw);
        return list.isEmpty() ? suRepo.findUserByProfileFullNameContaining(kw) : list;
    }

    @Override
    public UserProfile getAvatarByUserUid(String uid) {
        log.info("getAvatarByUserUid");
        return upRepo.findByUserId(uid);
    }
}
