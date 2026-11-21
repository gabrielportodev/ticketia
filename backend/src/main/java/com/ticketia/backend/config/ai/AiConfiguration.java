package com.ticketia.backend.config.ai;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatModel.ResponseFormat;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.Assert;

@Configuration(proxyBeanMethods = false)
@Profile({"ai", "worker"})
public class AiConfiguration {

    @Bean
    OpenAiChatModel classificationModel(
            @Value("${ticketia.ai.api-key}") String apiKey,
            @Value("${ticketia.ai.model}") String model,
            @Value("${ticketia.ai.base-url}") String baseUrl) throws IOException {
        Assert.hasText(apiKey, "ticketia.ai.api-key is required");
        Assert.hasText(model, "ticketia.ai.model must contain a model identifier");
        Assert.hasText(baseUrl, "ticketia.ai.base-url is required");
        var schema = new ClassPathResource("contracts/classification-v1.schema.json");
        var format = ResponseFormat.builder()
                .type(ResponseFormat.Type.JSON_SCHEMA)
                .jsonSchema(schema.getContentAsString(StandardCharsets.UTF_8))
                .strict(true)
                .build();
        var options = OpenAiChatOptions.builder()
                .apiKey(apiKey)
                .baseUrl(baseUrl)
                .model(model)
                .responseFormat(format)
                .timeout(Duration.ofSeconds(30))
                .maxRetries(0)
                .build();
        return OpenAiChatModel.builder().options(options).build();
    }
}
