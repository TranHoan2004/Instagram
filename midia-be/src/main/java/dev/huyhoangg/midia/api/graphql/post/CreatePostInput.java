package dev.huyhoangg.midia.api.graphql.post;

import dev.huyhoangg.midia.domain.model.post.PostVisibility;
import lombok.Data;

import java.util.List;

@Data
public class CreatePostInput {
    private String caption;
    private PostVisibility visibility = PostVisibility.PUBLIC;
    private List<String> attachmentIds;
} 