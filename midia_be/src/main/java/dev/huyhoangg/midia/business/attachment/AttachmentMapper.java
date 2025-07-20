package dev.huyhoangg.midia.business.attachment;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.huyhoangg.midia.domain.model.attachment.Attachment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Map;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface AttachmentMapper {

    @Mapping(target = "optimizedLinks", source = "optimizedLinks", qualifiedByName = "optimizedLinksToJson")
    dev.huyhoangg.midia.codegen.types.Attachment toGraphQLAttachmentType(Attachment attachment);

    @Named("optimizedLinksToJson")
    default Map<String, Object> optimizedLinksToJson(String optimizedLinks) {
        var objectMapper = new ObjectMapper();
        return objectMapper.convertValue(optimizedLinks, new TypeReference<Map<String, Object>>() {});
    }
}
