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
    private EntityManager entityManager;

    @Autowired
    private ObjectMapper json;

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

        entityManager.clear();
        TicketEntity storedTicket = repository.findById(protocol).orElseThrow();

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
}
