package com.ticketia.backend.modules.ticket;

import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClassificationService {

    private final TicketRepository tickets;
    private final ClassificationRepository classifications;
    private final ClassificationValidator validator;

    @Transactional
    public void apply(UUID protocol, String response, String modelId, String promptVersion) {
        var ticket = tickets.findByProtocol(protocol).orElseThrow();
        if (ticket.getStatus() != TicketStatus.PENDING_TRIAGE) {
            return;
        }

        var result = validator.validate(response).orElse(null);
        String reviewReason = null;
        if (result == null) {
            reviewReason = "INVALID_RESPONSE";
        } else if (result.get("requires_review").asBoolean()) {
            reviewReason = "MODEL_REQUESTED_REVIEW";
        }

        classifications.save(new TicketClassification(ticket, modelId, promptVersion, result, reviewReason));
        if (reviewReason == null) {
            ticket.setDepartment(result.get("category").asString());
            ticket.setStatus(TicketStatus.ROUTED);
        } else {
            ticket.setDepartment(null);
            ticket.setStatus(TicketStatus.NEEDS_REVIEW);
        }
    }
}
