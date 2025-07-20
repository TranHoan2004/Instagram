package dev.huyhoangg.midia.business.user;

import dev.huyhoangg.midia.domain.model.user.User;
import org.springframework.stereotype.Component;

@Component
public class UserConversionUtil {
    
    public dev.huyhoangg.midia.codegen.types.User toMinimalGraphQLUserType(User user) {
        if (user == null) return null;
        
        return dev.huyhoangg.midia.codegen.types.User.newBuilder()
                .id(user.getId())
                .username(user.getUsername())
                .profile(createMinimalProfile(user))
                .role(user.getRole() != null ? user.getRole().getName() : "USER")
                .stats(createDefaultStats())
                .build();
    }
    
    private dev.huyhoangg.midia.codegen.types.UserProfile createMinimalProfile(User user) {
        if (user.getProfile() != null) {
            return dev.huyhoangg.midia.codegen.types.UserProfile.newBuilder()
                    .fullName(user.getProfile().getFullName() != null ? user.getProfile().getFullName() : user.getUsername())
                    .username(user.getUsername())
                    .build();
        }
        
        return dev.huyhoangg.midia.codegen.types.UserProfile.newBuilder()
                .fullName(user.getUsername())
                .username(user.getUsername())
                .build();
    }
    
    private dev.huyhoangg.midia.codegen.types.UserStats createDefaultStats() {
        return dev.huyhoangg.midia.codegen.types.UserStats.newBuilder()
                .totalFollowers(0L)
                .totalFollowings(0L)
                .totalPosts(0L)
                .build();
    }
}