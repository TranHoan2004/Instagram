package dev.huyhoangg.midia.business.post;

import dev.huyhoangg.midia.business.attachment.AttachmentMapper;
import dev.huyhoangg.midia.business.user.UserMapper;
import dev.huyhoangg.midia.domain.model.post.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class, AttachmentMapper.class}
)
public interface PostMapper {

    @Mapping(target = "author", source = "author")
    @Mapping(target = "attachments", ignore = true)
    @Mapping(target = "comments", ignore = true)
    dev.huyhoangg.midia.codegen.types.Post toGraphQLPost(Post post);

    @Mapping(target = "author", source = "author")
    @Mapping(target = "attachments", source = "attachments")
    @Mapping(target = "comments", ignore = true)
    dev.huyhoangg.midia.codegen.types.Post toGraphQLPostWithAttachments(Post post);
}
