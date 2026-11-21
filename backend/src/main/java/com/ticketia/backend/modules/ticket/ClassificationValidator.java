package com.ticketia.backend.modules.ticket;

import java.io.IOException;
import java.util.Optional;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import com.networknt.schema.Schema;
import com.networknt.schema.SchemaRegistry;
import com.networknt.schema.dialect.Dialects;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.ObjectReader;

@Component
class ClassificationValidator {

    private final Schema schema;
    private final ObjectReader reader;

    ClassificationValidator(ObjectMapper mapper) throws IOException {
        reader = mapper.readerFor(JsonNode.class)
                .with(DeserializationFeature.FAIL_ON_TRAILING_TOKENS)
                .with(DeserializationFeature.FAIL_ON_READING_DUP_TREE_KEY);
        var resource = new ClassPathResource("contracts/classification-v1.schema.json");
        try (var input = resource.getInputStream()) {
            schema = SchemaRegistry.withDialect(Dialects.getDraft202012()).getSchema(input);
        }
    }

    Optional<JsonNode> validate(String response) {
        if (response == null || response.isBlank()) {
            return Optional.empty();
        }
        try {
            JsonNode result = reader.readTree(response);
            return schema.validate(result).isEmpty() ? Optional.of(result) : Optional.empty();
        } catch (JacksonException malformedJson) {
            return Optional.empty();
        }
    }
}
