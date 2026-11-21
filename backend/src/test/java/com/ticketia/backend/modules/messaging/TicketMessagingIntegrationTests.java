package com.ticketia.backend.modules.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Duration;
import java.util.UUID;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfSystemProperty;
import org.springframework.amqp.rabbit.listener.RabbitListenerEndpointRegistry;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.ScheduledAnnotationBeanPostProcessor;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.ticketia.backend.modules.classification.AiClassifier;
import com.ticketia.backend.modules.ticket.ClassificationRepository;
import com.ticketia.backend.modules.ticket.TicketRepository;
import com.ticketia.backend.modules.ticket.TicketStatus;

import tools.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {
        "ticketia.ai.model=test-model",
        "ticketia.ai.api-key=test-key",
        "ticketia.ai.base-url=http://127.0.0.1",
        "ticketia.outbox.interval-ms=100"
})
@AutoConfigureMockMvc
@ActiveProfiles({"publisher", "worker"})
@DirtiesContext
@EnabledIfSystemProperty(named = "ticketia.test.messaging", matches = "true")
class TicketMessagingIntegrationTests {

    private static final String SCHEMA = "messaging_test_" + UUID.randomUUID().toString().replace("-", "");

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private TicketOutboxRepository outbox;

    @Autowired
    private TicketRepository tickets;

    @Autowired
    private ClassificationRepository classifications;

    @MockitoBean
    private AiClassifier classifier;

    @DynamicPropertySource
    static void isolateDatabase(DynamicPropertyRegistry registry) {
        registry.add("spring.flyway.default-schema", () -> SCHEMA);
        registry.add("spring.datasource.hikari.schema", () -> SCHEMA);
    }

    @Test
    void routesCommittedTicketThroughRabbitAndRecordsCompletion() throws Exception {
        String message = "Fui cobrado duas vezes";
        when(classifier.classify(message)).thenAnswer(call -> {
            assertThat(TransactionSynchronizationManager.isActualTransactionActive()).isFalse();
            return """
                    {"category":"FINANCE","priority":"HIGH","subject":"Cobrança duplicada","requires_review":false}
                    """;
        });
        var response = mvc.perform(post("/tickets").contentType(MediaType.APPLICATION_JSON)
                .content("{\"message\":\"Fui cobrado duas vezes\"}"))
                .andExpect(status().isCreated()).andReturn().getResponse();
        var data = json.readTree(response.getContentAsByteArray()).required("data");
        UUID protocol = UUID.fromString(data.required("protocol").asString());
        assertThat(data.required("status").asString()).isEqualTo("PENDENTE_TRIAGEM");

        await().atMost(Duration.ofSeconds(20)).untilAsserted(() -> {
            var event = outbox.findByProtocol(protocol).orElseThrow();
            assertThat(event.getPublishedAt()).isNotNull();
            assertThat(event.getProcessedAt()).isNotNull();
        });
        assertThat(outbox.count()).isOne();
        assertThat(tickets.count()).isOne();
        var ticket = tickets.findById(protocol).orElseThrow();
        assertThat(ticket.getOriginalMessage()).isEqualTo(message);
        assertThat(ticket.getDepartment()).isEqualTo("FINANCE");
        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.ROUTED);
        assertThat(classifications.findById(protocol).orElseThrow().getModelId()).isEqualTo("test-model");
        verify(classifier).classify(message);
    }

    @AfterAll
    static void removeTestSchema(@Autowired ScheduledAnnotationBeanPostProcessor schedules,
            @Autowired RabbitListenerEndpointRegistry listeners, @Autowired JdbcTemplate jdbc) {
        schedules.destroy();
        listeners.stop();
        jdbc.execute("DROP SCHEMA " + SCHEMA + " CASCADE");
    }
}
