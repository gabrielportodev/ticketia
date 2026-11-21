package com.ticketia.backend.modules.messaging;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;

import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;

import com.ticketia.backend.modules.ticket.TicketRepository;
import com.ticketia.backend.modules.ticket.TicketService;
import com.ticketia.backend.modules.ticket.dtos.CreateTicketRequest;

import jakarta.persistence.EntityManager;

@SpringBootTest
class TicketOutboxRollbackTests {

    @Autowired
    private TicketService service;

    @Autowired
    private TicketRepository tickets;

    @Autowired
    private EntityManager entityManager;

    @MockitoSpyBean
    private TicketOutboxRepository outbox;

    @Test
    void rollsBackTicketWhenPostgresRejectsOutboxInsert() {
        var protocol = new AtomicReference<UUID>();
        doAnswer(call -> {
            TicketOutboxEvent event = call.getArgument(0);
            protocol.set(event.getProtocol());
            // Force two receipts for the same ticket to violate the PostgreSQL uniqueness constraint.
            entityManager.persist(new TicketOutboxEvent(event.getProtocol(), event.getOccurredAt()));
            entityManager.persist(event);
            return event;
        }).when(outbox).save(any(TicketOutboxEvent.class));

        assertThatThrownBy(() -> service.create(new CreateTicketRequest("Mensagem de teste")))
                .isInstanceOf(DataIntegrityViolationException.class);
        assertThat(protocol.get()).isNotNull();
        assertThat(tickets.findById(protocol.get())).isEmpty();
        assertThat(outbox.findByProtocol(protocol.get())).isEmpty();
    }
}
