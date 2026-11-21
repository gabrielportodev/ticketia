package com.ticketia.backend.modules.messaging;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

public interface TicketOutboxRepository extends JpaRepository<TicketOutboxEvent, UUID> {

    @Query(value = """
            SELECT * FROM ticket_outbox WHERE published_at IS NULL
            ORDER BY occurred_at, event_id LIMIT 1 FOR UPDATE SKIP LOCKED
            """, nativeQuery = true)
    Optional<TicketOutboxEvent> lockNextPending();

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TicketOutboxEvent> findByEventId(UUID eventId);

    Optional<TicketOutboxEvent> findByProtocol(UUID protocol);
}
