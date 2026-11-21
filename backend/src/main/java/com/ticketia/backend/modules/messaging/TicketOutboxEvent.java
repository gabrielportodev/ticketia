package com.ticketia.backend.modules.messaging;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ticket_outbox")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TicketOutboxEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID eventId;

    private UUID protocol;
    private Instant occurredAt;
    private Instant publishedAt;
    private Instant processedAt;

    public TicketOutboxEvent(UUID protocol, Instant occurredAt) {
        this.protocol = protocol;
        this.occurredAt = occurredAt;
    }

    void markPublished() {
        publishedAt = Instant.now();
    }

    void markProcessed() {
        processedAt = Instant.now();
    }
}
