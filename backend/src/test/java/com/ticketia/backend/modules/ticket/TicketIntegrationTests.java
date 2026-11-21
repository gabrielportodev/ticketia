package com.ticketia.backend.modules.ticket;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.springframework.transaction.annotation.Transactional;

import com.ticketia.backend.modules.messaging.TicketOutboxRepository;
import jakarta.persistence.EntityManager;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class TicketIntegrationTests {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private TicketRepository repository;

    @Autowired
    private TicketOutboxRepository outbox;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private ClassificationService classifications;

    @Autowired
    private ClassificationRepository classificationRepository;

    private static final String FINANCE_RESPONSE = """
            {"category":"FINANCE","priority":"HIGH","subject":"Cobrança duplicada","requires_review":false}
            """;

    @Test
    void returnsProtocolForStoredTicketPendingTriage() throws Exception {
        String message = "  Fui cobrado duas vezes.  ";
        var response = mvc.perform(post("/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("message", message))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Atendimento registrado."))
                .andExpect(jsonPath("$.meta").doesNotExist())
                .andExpect(jsonPath("$.total").doesNotExist())
                .andReturn().getResponse();

        var data = json.readTree(response.getContentAsByteArray()).required("data");
        UUID protocol = UUID.fromString(data.required("protocol").asString());

        entityManager.flush();
        entityManager.clear();
        TicketEntity storedTicket = repository.findById(protocol).orElseThrow();

        var event = outbox.findByProtocol(protocol).orElseThrow();
        assertThat(event.getEventId()).isNotNull();
        assertThat(event.getOccurredAt()).isEqualTo(storedTicket.getCreatedAt());
        assertThat(event.getPublishedAt()).isNull();
        assertThat(event.getProcessedAt()).isNull();
        assertThat(storedTicket.getOriginalMessage()).isEqualTo(message);
        assertThat(storedTicket.getStatus()).isEqualTo(TicketStatus.PENDING_TRIAGE);
        assertThat(storedTicket.getDepartment()).isNull();
        assertThat(data.required("status").asString()).isEqualTo("PENDENTE_TRIAGEM");
        assertThat(Instant.parse(data.required("created_at").asString())).isEqualTo(storedTicket.getCreatedAt());
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "{}", "{\"message\":null}", "{\"message\":\"\"}", "{\"message\":\"   \"}"})
    void rejectsMissingOrBlankMessage(String body) throws Exception {
        mvc.perform(post("/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").isString())
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    void routesFinanceTicketAndPreservesOriginalResultOnRedelivery() throws Exception {
        UUID protocol = receiveTicket();
        classifications.apply(protocol, FINANCE_RESPONSE, "test-model", "v1");
        TicketEntity routed = reload(protocol);
        assertThat(routed.getStatus().getResponseValue()).isEqualTo("ENCAMINHADO");
        assertThat(routed.getDepartment()).isEqualTo("FINANCE");

        classifications.apply(protocol, "{}", "another-model", "v2");
        assertThat(reload(protocol).getDepartment()).isEqualTo("FINANCE");
        var result = classificationRepository.findById(protocol).orElseThrow();
        assertThat(result.getCategory()).isEqualTo("FINANCE");
        assertThat(result.getPriority()).isEqualTo("HIGH");
        assertThat(result.getSubject()).isEqualTo("Cobrança duplicada");
        assertThat(result.getRequiresReview()).isEqualTo(false);
        assertThat(result.getModelId()).isEqualTo("test-model");
        assertThat(result.getSchemaVersion()).isEqualTo(1);
        assertThat(result.getReviewReason()).isNull();
        assertThat(result.getTicket().getProtocol()).isEqualTo(protocol);
        assertThat(result.getRecordedAt()).isNotNull();
        assertThat(result.getPromptVersion()).isEqualTo("v1");
    }

    @Test
    void retainsValidClassificationWhenModelRequestsReview() throws Exception {
        UUID protocol = receiveTicket();
        classifications.apply(protocol, FINANCE_RESPONSE.replace("false", "true"), "test-model", "v1");

        TicketEntity ticket = reload(protocol);
        assertThat(ticket.getStatus().getResponseValue()).isEqualTo("EM_REVISAO");
        assertThat(ticket.getDepartment()).isNull();
        var result = classificationRepository.findById(protocol).orElseThrow();
        assertThat(result.getRequiresReview()).isEqualTo(true);
        assertThat(result.getCategory()).isEqualTo("FINANCE");
        assertThat(result.getReviewReason()).isEqualTo("MODEL_REQUESTED_REVIEW");
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "{\"category\":\"FINANCE\",\"priority\":\"HIGH\",\"subject\":\"Cobrança duplicada\"}",
            "{\"category\":\"UNKNOWN\",\"priority\":\"HIGH\",\"subject\":\"Cobrança\",\"requires_review\":false}",
            "{\"category\":\"FINANCE\",\"priority\":\"HIGH\",\"subject\":\"Cobrança\",\"requires_review\":\"false\"}",
            "{\"category\":\"FINANCE\",\"priority\":\"HIGH\",\"subject\":\"Cobrança\",\"requires_review\":false,\"extra\":0}",
            "invalid json"
    })
    void sendsInvalidResponseToReviewWithoutAssigningDepartment(String response) throws Exception {
        UUID protocol = receiveTicket();
        classifications.apply(protocol, response, "test-model", "v1");

        TicketEntity ticket = reload(protocol);
        assertThat(ticket.getStatus().getResponseValue()).isEqualTo("EM_REVISAO");
        assertThat(ticket.getDepartment()).isNull();
        var result = classificationRepository.findById(protocol).orElseThrow();
        assertThat(result.getCategory()).isNull();
        assertThat(result.getReviewReason()).isEqualTo("INVALID_RESPONSE");
    }

    private UUID receiveTicket() throws Exception {
        var response = mvc.perform(post("/tickets")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("message", "Fui cobrado duas vezes"))))
                .andExpect(status().isCreated())
                .andReturn().getResponse();
        return UUID.fromString(json.readTree(response.getContentAsByteArray()).at("/data/protocol").asString());
    }

    private TicketEntity reload(UUID protocol) {
        entityManager.flush();
        entityManager.clear();
        var ticket = repository.findById(protocol).orElseThrow();
        assertThat(ticket.getOriginalMessage()).isEqualTo("Fui cobrado duas vezes");
        return ticket;
    }
}
