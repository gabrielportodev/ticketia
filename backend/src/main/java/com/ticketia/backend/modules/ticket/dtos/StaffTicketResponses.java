package com.ticketia.backend.modules.ticket.dtos;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.ticketia.backend.modules.ticket.TicketStatus;

public final class StaffTicketResponses {

    private StaffTicketResponses() {
    }

    public record Summary(UUID protocol, TicketStatus status, String department,
            @JsonProperty("created_at") Instant createdAt, String subject, String priority) {
    }

    public record Detail(Summary ticket, @JsonProperty("original_message") String originalMessage,
            Classification classification, List<RoutingChange> history) {
    }

    public record Classification(String category, String priority, String subject,
            @JsonProperty("review_reason") String reviewReason) {
    }

    public record RoutingChange(@JsonProperty("changed_by") String changedBy,
            @JsonProperty("changed_at") Instant changedAt,
            @JsonProperty("previous_department") String previousDepartment,
            @JsonProperty("new_department") String newDepartment) {
    }
}
