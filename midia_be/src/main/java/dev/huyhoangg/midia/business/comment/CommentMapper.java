package dev.huyhoangg.midia.business.comment;

import dev.huyhoangg.midia.business.user.UserMapper;
import dev.huyhoangg.midia.domain.model.comment.Comment;
import graphql.relay.Connection;
import graphql.relay.DefaultConnection;
import graphql.relay.DefaultEdge;
import graphql.relay.Edge;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.stream.Collectors;
@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class}
)
public interface CommentMapper {
    @Mapping(target = "_parent", ignore = true)
    @Mapping(target = "replies", ignore = true)
    @Mapping(target = "likedBy", ignore = true)
    dev.huyhoangg.midia.codegen.types.Comment toGraphQLComment(Comment comment);
    
    default Connection<dev.huyhoangg.midia.codegen.types.Comment> toCommentConnection(Connection<Comment> connection) {
        List<Edge<dev.huyhoangg.midia.codegen.types.Comment>> edges = connection.getEdges().stream()
                .map(edge -> new DefaultEdge<>(
                    toGraphQLComment(edge.getNode()), 
                    edge.getCursor()
                ))
                .collect(Collectors.toList());

        return new DefaultConnection<>(edges, connection.getPageInfo());
    }
}