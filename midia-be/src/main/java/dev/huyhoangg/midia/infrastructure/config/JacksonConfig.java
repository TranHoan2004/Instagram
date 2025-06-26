package dev.huyhoangg.midia.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.PropertyName;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.introspect.Annotated;
import com.fasterxml.jackson.databind.introspect.JacksonAnnotationIntrospector;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import dev.huyhoangg.midia.dgraph.annotation.DgraphPredicate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class JacksonConfig {

    static class DgraphAnnotationIntrospect extends JacksonAnnotationIntrospector {

        @Override
        public PropertyName findNameForSerialization(Annotated a) {
            var dgraphPredicate = a.getAnnotation(DgraphPredicate.class);
            if (dgraphPredicate != null) {
                return PropertyName.construct(dgraphPredicate.value());
            }
            return super.findNameForSerialization(a);
        }

        @Override
        public PropertyName findNameForDeserialization(Annotated a) {
            var dgraphPredicate = a.getAnnotation(DgraphPredicate.class);
            if (dgraphPredicate != null) {
                return PropertyName.construct(dgraphPredicate.value());
            }
            return super.findNameForDeserialization(a);
        }
    }

    @Bean
    public ObjectMapper objectMapper() {
        var objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.setAnnotationIntrospector(new DgraphAnnotationIntrospect());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return objectMapper;
    }
}
