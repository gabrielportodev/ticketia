package com.atendeia.backend.modules.ticket.dtos;

import java.time.Instant;
import java.util.UUID;

import com.atendeia.backend.modules.ticket.TicketStatus;
import com.fasterxml.jackson.annotation.JsonProperty;

public record CreateTicketResponse(
        @JsonProperty("protocol")
        UUID protocol,
        TicketStatus status,
        @JsonProperty("created_at")
        Instant createdAt
        ) {

}
