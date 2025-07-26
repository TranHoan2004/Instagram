package dev.huyhoangg.midia.api.graphql.comment;

import org.springframework.security.access.prepost.PreAuthorize;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsMutation;
import com.netflix.graphql.dgs.InputArgument;

import dev.huyhoangg.midia.business.comment.CommentMapper;
import dev.huyhoangg.midia.business.comment.CommentService;
import dev.huyhoangg.midia.business.user.UserCommonService;
import dev.huyhoangg.midia.codegen.types.Comment;
import dev.huyhoangg.midia.codegen.types.CommentInput;
import lombok.RequiredArgsConstructor;

@DgsComponent
@RequiredArgsConstructor
public class CommentMutation {

    private final CommentService commentService;
    private final UserCommonService userCommonService;
    private final CommentMapper commentMapper;

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public Comment createComment(@InputArgument CommentInput input) {
        Comment comment = commentMapper.toGraphQLComment(commentService.createComment(input));
        return comment;
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public Boolean deleteComment(@InputArgument String id) {
        String userId = userCommonService.getMyInfo().getId();
        return commentService.deleteComment(id, userId);
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public Boolean likeComment(@InputArgument String commentId) {
        String userId = userCommonService.getMyInfo().getId();
        commentService.likeComment(commentId, userId);
        return true;
    }

    @DgsMutation
    @PreAuthorize("isAuthenticated()")
    public Boolean unlikeComment(@InputArgument String commentId) {
        String userId = userCommonService.getMyInfo().getId();
        commentService.unlikeComment(commentId, userId);
        return true;
    }
}