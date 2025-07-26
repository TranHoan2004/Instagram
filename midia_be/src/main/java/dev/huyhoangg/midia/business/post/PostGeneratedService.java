package dev.huyhoangg.midia.business.post;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.domain.model.post.Post;
import dev.huyhoangg.midia.domain.model.user.User;
import dev.huyhoangg.midia.infrastructure.db.persistence.DgraphTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class PostGeneratedService {
    private final DgraphTemplate dgraphTemplate;
    private final UserCommonService userCommonService;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @Value("${newsfeed.generation.cache-duration:5}")
    private long cacheTTL;

    @Value("${newsfeed.generation.batch-size:100}")
    private int batchSize;

    @Scheduled(cron = "${newsfeed.generation.cron-expression}")
    public void scheduleNewsFeedGeneration() {
        log.info("Generating news feed");

        var activeUsers = userCommonService.getActiveUsers();

        try {
            if (activeUsers.size() < 50) {
                process(activeUsers);
            } else {
                for (int i = 0; i < activeUsers.size(); i += batchSize) {
                    var batch = activeUsers.subList(i, Math.min(i + batchSize, activeUsers.size()));
                    process(batch);
                }
            }

            log.info("News feed generated completed");
        } catch (Exception e) {
            log.error("Failed to generate news feed", e);
        }
    }

    public List<Post> generateNewsFeedForUser(String userId) {
        var currentDate = LocalDate.now();
        var lastWeek = currentDate.minusWeeks(1);
        var query = """
                query generate_newsfeed($userId: string, $last7daysDate: string) {
                  var(func: type(User)) @filter(eq(id, $userId)) {
                    user.followings {
                      following_posts as user.posts @filter(ge(created_at, $last7daysDate) AND not(has(deleted_at)))
                        (orderdesc: created_at, orderdesc: post.total_likes, orderdesc: post.total_comments, first: 20) {}
                    }
                  }

                  trending_posts as var(func: type(Post), orderdesc: created_at, orderdesc: post.total_likes, orderdesc: post.total_comments, first: 15)
                    @filter(
                    	eq(post.visibility, "PUBLIC")
                    	AND ge(created_at, $last7daysDate)
                        AND not(has(deleted_at))) {}

                  newsfeed(func: uid(following_posts, trending_posts), orderdesc: created_at, orderdesc: post.total_likes, orderdesc: post.total_comments)
                    @filter(type(Post)) {
                    uid
                    expand(Post) {
                      uid
                      expand(User, Attachment)
                    }
                  }
                }
                """;
        return dgraphTemplate.executeReadOnlyQuery(txn -> {
            var vars = new HashMap<String, String>();
            vars.put("$userId", userId);
            vars.put("$last7daysDate", lastWeek.toString());
            var response = txn.queryWithVars(query, vars);
            var json = objectMapper.readTree(response.getJson().toStringUtf8());
            var newsfeed = json.get("newsfeed");
            var posts = objectMapper.readValue(newsfeed.toString(), new TypeReference<List<Post>>() {});

            var cacheKey = String.format("newsfeed:%s", userId);
            var cacheValue = objectMapper.writeValueAsString(posts);
            redisTemplate.opsForValue().set(cacheKey, cacheValue, Duration.ofMinutes(cacheTTL));
            log.info("Save cache, key: {} value: {}", cacheKey, cacheValue);
            return posts;
        });
    }

    @Async("asyncExecutor")
    protected CompletableFuture<Void> generateNewsFeedAsync(String userId) {
        return CompletableFuture.runAsync(() -> {
            try {
                generateNewsFeedForUser(userId);
            } catch (Exception e) {
                log.error("Failed to generate news feed for user {}", userId, e);
            }
        });
    }

    @Async("asyncExecutor")
    protected CompletableFuture<Void> process(List<User> users) {
        var futures = users.stream().map(User::getId).map(this::generateNewsFeedAsync).toList();

        return CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    }


}
