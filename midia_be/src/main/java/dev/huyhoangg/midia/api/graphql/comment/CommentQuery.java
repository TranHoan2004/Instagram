package dev.huyhoangg.midia.api.graphql.comment;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsData;
import com.netflix.graphql.dgs.DgsDataFetchingEnvironment;
import dev.huyhoangg.midia.business.comment.CommentMapper;
import dev.huyhoangg.midia.business.comment.CommentService;
import dev.huyhoangg.midia.business.user.UserMapper;
import dev.huyhoangg.midia.codegen.types.Comment;
import dev.huyhoangg.midia.codegen.types.User;
import graphql.relay.Connection;
import lombok.RequiredArgsConstructor;

@DgsComponent
@RequiredArgsConstructor
public class CommentQuery {
    private final CommentService commentService;
    private final CommentMapper commentMapper;
    private final UserMapper userMapper;

    @DgsData(parentType = "Comment", field = "replies")
    public Connection<Comment> replies(DgsDataFetchingEnvironment dfe) {
        Comment comment = dfe.getSource();
        Integer first = dfe.getArgument("first");
        String after = dfe.getArgument("after");
        
        var connection = commentService.getRepliesByParentId(comment.getId(), first, after);
        return commentMapper.toCommentConnection(connection);
    }

       @DgsData(parentType = "Comment", field = "likedBy")
    public Connection<User> likedBy(DgsDataFetchingEnvironment dfe) {
        dev.huyhoangg.midia.codegen.types.Comment comment = dfe.getSource();
        Integer first = dfe.getArgument("first");
        String after = dfe.getArgument("after");

        var connection = commentService.getLikesByCommentId(comment.getId(), first, after);
        return userMapper.toUserConnection(connection);
    }
}