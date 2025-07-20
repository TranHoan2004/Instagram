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

    @Mapping(target = "author", ignore = true)
    @Mapping(target = "attachments", ignore = true)
    dev.huyhoangg.midia.codegen.types.Post toGraphQLPost(Post post);
}
