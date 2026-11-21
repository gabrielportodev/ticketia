package com.ticketia.backend.modules.messaging;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketia.backend.modules.ticket.ClassificationService;

@Service
@Profile("worker")
class TicketProcessing {

    private final TicketOutboxRepository outbox;
    private final ClassificationService classifications;
    private final String modelId;

    TicketProcessing(TicketOutboxRepository outbox, ClassificationService classifications,
            @Value("${ticketia.ai.model}") String modelId) {
        this.outbox = outbox;
        this.classifications = classifications;
        this.modelId = modelId;
    }

    @Transactional
    public void complete(UUID eventId, String result) {
        var event = outbox.findByEventId(eventId).orElseThrow();
        if (event.getProcessedAt() == null) {
            classifications.apply(event.getProtocol(), result, modelId, "v1");
            event.markProcessed();
        }
    }
}
