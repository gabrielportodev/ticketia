package com.ticketia.backend.modules.messaging;

import org.springframework.amqp.AmqpRejectAndDontRequeueException;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import com.ticketia.backend.modules.classification.AiClassifier;
import com.ticketia.backend.modules.ticket.TicketRepository;
import com.ticketia.backend.modules.ticket.TicketStatus;

import lombok.RequiredArgsConstructor;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Service
@Profile("worker")
@RequiredArgsConstructor
class TicketWorker {

    private final TicketOutboxRepository outbox;
    private final TicketRepository tickets;
    private final ObjectMapper json;
    private final AiClassifier classifier;
    private final TicketProcessing processing;

    @RabbitListener(queues = TicketReceived.ROUTING_KEY)
    void receive(Message message) {
        TicketReceived received;
        try {
            received = json.readValue(message.getBody(), TicketReceived.class);
        } catch (JacksonException invalid) {
            throw new AmqpRejectAndDontRequeueException("Malformed ticket event", invalid);
        }
        if (received == null || received.eventId() == null) {
            throw new AmqpRejectAndDontRequeueException("Missing ticket event identifier");
        }
        var event = outbox.findById(received.eventId()).orElseThrow(
                () -> new AmqpRejectAndDontRequeueException("Unknown ticket event"));
        if (!TicketReceived.from(event).equals(received)) {
            throw new AmqpRejectAndDontRequeueException("Ticket event does not match the outbox");
        }
        if (event.getProcessedAt() != null) {
            return;
        }

        var ticket = tickets.findById(received.protocol()).orElseThrow();
        String result = ticket.getStatus() == TicketStatus.PENDING_TRIAGE
                ? classifier.classify(ticket.getOriginalMessage()) : null;
        processing.complete(event.getEventId(), result);
    }
}
