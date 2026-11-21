package com.ticketia.backend.config.ai;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicReference;

import com.sun.net.httpserver.HttpServer;
import com.ticketia.backend.modules.classification.AiClassifier;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

class AiClassifierTests {

    @Test
    void sendsConfiguredModelAndClassificationSchemaToProvider() throws Exception {
        var request = new AtomicReference<JsonNode>();
        var mapper = JsonMapper.builder().build();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/openai/v1/chat/completions", exchange -> {
            try (exchange) {
                request.set(mapper.readTree(exchange.getRequestBody()));
                byte[] reply = """
                        {"id":"test","model":"test-model","object":"chat.completion","created":1,
                         "choices":[{"index":0,"message":{"role":"assistant","content":"{}"},"finish_reason":"stop"}]}
                        """.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "application/json");
                exchange.sendResponseHeaders(200, reply.length);
                exchange.getResponseBody().write(reply);
            }
        });
        server.start();
        try {
            String url = "http://127.0.0.1:" + server.getAddress().getPort() + "/openai/v1";
            var model = new AiConfiguration().classificationModel("test-key", "test-model", url);
            assertThat(new AiClassifier(model).classify("Cobrança duplicada")).isEqualTo("{}");
            assertThat(request.get().at("/model").asString()).isEqualTo("test-model");
            assertThat(request.get().at("/messages/1/content").asString()).isEqualTo("Cobrança duplicada");
            assertThat(request.get().at("/response_format/json_schema/strict").asBoolean()).isTrue();
            assertThat(request.get().at("/response_format/json_schema/schema/required").size()).isEqualTo(4);
        } finally {
            server.stop(0);
        }
    }
}
