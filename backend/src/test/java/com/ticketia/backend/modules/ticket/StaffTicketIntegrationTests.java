package com.ticketia.backend.modules.ticket;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.httpBasic;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;
import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import tools.jackson.databind.ObjectMapper;

@SpringBootTest(properties = {"""
        ticketia.staff.users=[{"username":"reviewer","password":"reviewer-test","reviewer":true},{"username":"finance","password":"finance-test","department":"FINANCE"}]
        """, "spring.security.user.name=system", "spring.security.user.password=system-test"})
@AutoConfigureMockMvc
@Transactional
class StaffTicketIntegrationTests {

    private static final String FINANCE_RESULT = """
            {"category":"FINANCE","priority":"HIGH","subject":"Cobrança duplicada","requires_review":false}
            """;

    private static final String SUPPORT_RESULT = """
            {"category":"SUPPORT","priority":"MEDIUM","subject":"Problema técnico","requires_review":false}
            """;

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @Autowired
    private EntityManager entityManager;

    @Autowired
    private TicketRepository tickets;

    @Autowired
    private ClassificationService classifications;

    @Autowired
    private ClassificationRepository classificationRecords;

    @Test
    void requiresAuthenticationAndCsrfForStaffRequests() throws Exception {
        mvc.perform(get("/staff/tickets"))
                .andExpect(status().isUnauthorized());
        mvc.perform(post("/staff/login").param("username", "reviewer").param("password", "reviewer-test"))
                .andExpect(status().isForbidden());

        var csrf = csrf(null);
        mvc.perform(post("/staff/login").session(csrf.session()).header(csrf.header(), csrf.token())
                .param("username", "reviewer").param("password", "wrong-password"))
                .andExpect(status().isUnauthorized());

        var session = login("reviewer", "reviewer-test");
        mvc.perform(get("/staff/session").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("reviewer"))
                .andExpect(jsonPath("$.data.reviewer").value(true));
        mvc.perform(patch("/staff/tickets/{protocol}/routing", UUID.randomUUID()).session(session)
                .contentType(MediaType.APPLICATION_JSON).content("{\"department\":\"SUPPORT\"}"))
                .andExpect(status().isForbidden());

        var logout = csrf(session);
        mvc.perform(post("/staff/logout").session(session).header(logout.header(), logout.token()))
                .andExpect(status().isNoContent());
        assertThat(session.isInvalid()).isTrue();
    }

    @Test
    void keepsStaffCredentialsSeparateFromExistingBasicAuthentication() throws Exception {
        mvc.perform(get("/actuator").with(httpBasic("system", "system-test")))
                .andExpect(status().isOk());
        mvc.perform(get("/actuator").with(httpBasic("reviewer", "reviewer-test")))
                .andExpect(status().isUnauthorized());

        var csrf = csrf(null);
        mvc.perform(post("/staff/login").session(csrf.session()).header(csrf.header(), csrf.token())
                .param("username", "system").param("password", "system-test"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void scopesListDetailAndUpdatesToTheAssignedDepartment() throws Exception {
        UUID finance = createTicket("Cobrança duplicada.");
        UUID support = createTicket("Falha no sistema.");
        UUID pending = createTicket("Preciso de ajuda.");
        classifications.apply(finance, FINANCE_RESULT, "test-model", "v1");
        classifications.apply(support, SUPPORT_RESULT, "test-model", "v1");

        var session = login("finance", "finance-test");
        mvc.perform(get("/staff/tickets").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].protocol", hasItem(finance.toString())))
                .andExpect(jsonPath("$.data[*].subject", hasItem("Cobrança duplicada")))
                .andExpect(jsonPath("$.data[*].protocol", not(hasItem(support.toString()))))
                .andExpect(jsonPath("$.data[*].protocol", not(hasItem(pending.toString()))));
        mvc.perform(get("/staff/tickets").param("page", "2").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.current_page").value(2));
        mvc.perform(get("/staff/tickets").param("department", "SUPPORT").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.total").value(0));
        mvc.perform(get("/staff/tickets/{protocol}", support).session(session))
                .andExpect(status().isNotFound());
        sendRoute(session, support, "FINANCE").andExpect(status().isNotFound());

        sendRoute(session, finance, "SUPPORT").andExpect(status().isNoContent());
        mvc.perform(get("/staff/tickets/{protocol}", finance).session(session))
                .andExpect(status().isNotFound());
    }

    @Test
    void showsReviewQueueAndKeepsOriginalClassificationAndRoutingHistory() throws Exception {
        UUID protocol = createTicket("Fui cobrado duas vezes.");
        classifications.apply(protocol, FINANCE_RESULT.replace("false", "true"), "test-model", "v1");
        var session = login("reviewer", "reviewer-test");

        mvc.perform(get("/staff/tickets").param("status", "NEEDS_REVIEW").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].protocol", hasItem(protocol.toString())));
        sendRoute(session, protocol, "INVALID").andExpect(status().isBadRequest());
        sendRoute(session, protocol, "FINANCE").andExpect(status().isNoContent());
        sendRoute(session, protocol, "SUPPORT").andExpect(status().isNoContent());
        sendRoute(session, protocol, "SUPPORT").andExpect(status().isNoContent());

        mvc.perform(get("/staff/tickets/{protocol}", protocol).session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.original_message").value("Fui cobrado duas vezes."))
                .andExpect(jsonPath("$.data.ticket.department").value("SUPPORT"))
                .andExpect(jsonPath("$.data.ticket.status").value("ENCAMINHADO"))
                .andExpect(jsonPath("$.data.classification.category").value("FINANCE"))
                .andExpect(jsonPath("$.data.classification.review_reason").value("MODEL_REQUESTED_REVIEW"))
                .andExpect(jsonPath("$.data.history.length()").value(2))
                .andExpect(jsonPath("$.data.history[0].changed_by").value("reviewer"))
                .andExpect(jsonPath("$.data.history[0].changed_at").isString())
                .andExpect(jsonPath("$.data.history[0].previous_department").value("FINANCE"))
                .andExpect(jsonPath("$.data.history[0].new_department").value("SUPPORT"))
                .andExpect(jsonPath("$.data.history[1].previous_department").doesNotExist())
                .andExpect(jsonPath("$.data.history[1].new_department").value("FINANCE"));
    }

    @Test
    void preservesManualDecisionWhenDelayedClassificationArrives() throws Exception {
        UUID protocol = createTicket("Não consigo usar a plataforma.");
        var session = login("reviewer", "reviewer-test");
        mvc.perform(get("/staff/tickets").param("status", "PENDING_TRIAGE").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[*].protocol", hasItem(protocol.toString())));
        sendRoute(session, protocol, "ACCOUNT_ACCESS").andExpect(status().isNoContent());
        entityManager.flush();
        entityManager.clear();

        classifications.apply(protocol, SUPPORT_RESULT, "test-model", "v1");

        var ticket = tickets.findById(protocol).orElseThrow();
        assertThat(ticket.getStatus()).isEqualTo(TicketStatus.ROUTED);
        assertThat(ticket.getDepartment()).isEqualTo("ACCOUNT_ACCESS");
        assertThat(classificationRecords.findById(protocol)).isEmpty();
    }

    private UUID createTicket(String message) {
        return tickets.saveAndFlush(new TicketEntity(message)).getProtocol();
    }

    private MockHttpSession login(String username, String password) throws Exception {
        var csrf = csrf(null);
        String previousId = csrf.session().getId();
        var result = mvc.perform(post("/staff/login").session(csrf.session()).header(csrf.header(), csrf.token())
                .param("username", username).param("password", password)
                .with(request -> {
                    request.setRequestedSessionId(previousId);
                    request.setRequestedSessionIdValid(true);
                    return request;
                }))
                .andExpect(status().isNoContent())
                .andReturn();
        var session = (MockHttpSession) result.getRequest().getSession(false);
        assertThat(session.getId()).isNotEqualTo(previousId);
        return session;
    }

    private Csrf csrf(MockHttpSession session) throws Exception {
        var request = get("/staff/csrf");
        if (session != null) {
            request.session(session);
        }
        var result = mvc.perform(request).andExpect(status().isOk()).andReturn();
        var data = json.readTree(result.getResponse().getContentAsByteArray()).required("data");
        return new Csrf((MockHttpSession) result.getRequest().getSession(false),
                data.required("header").asString(), data.required("token").asString());
    }

    private ResultActions sendRoute(MockHttpSession session, UUID protocol,
            String department) throws Exception {
        var csrf = csrf(session);
        return mvc.perform(patch("/staff/tickets/{protocol}/routing", protocol).session(session)
                .header(csrf.header(), csrf.token())
                .contentType(MediaType.APPLICATION_JSON)
                .content(json.writeValueAsBytes(Map.of("department", department))));
    }

    private record Csrf(MockHttpSession session, String header, String token) {
    }
}
