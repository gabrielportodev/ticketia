package com.ticketia.backend.modules.messaging;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;

record TicketReceived(
        @JsonProperty("event_id") UUID eventId,
        @JsonProperty("event_type") String eventType,
        @JsonProperty("schema_version") int schemaVersion,
        @JsonProperty("occurred_at") Instant occurredAt,
        UUID protocol) {

    static final String ROUTING_KEY = "ticket.received.v1";

    static TicketReceived from(TicketOutboxEvent event) {
        return new TicketReceived(event.getEventId(), "ticket.received", 1, event.getOccurredAt(), event.getProtocol());
    }
}
