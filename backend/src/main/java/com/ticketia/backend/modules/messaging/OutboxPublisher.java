package com.ticketia.backend.modules.messaging;

import java.util.concurrent.TimeUnit;

import org.springframework.amqp.core.MessageBuilder;
import org.springframework.amqp.core.MessageDeliveryMode;
import org.springframework.amqp.rabbit.connection.CorrelationData;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import tools.jackson.databind.ObjectMapper;

@Service
@Profile("publisher")
@RequiredArgsConstructor
public class OutboxPublisher {

    private final TicketOutboxRepository outbox;
    private final RabbitTemplate rabbit;
    private final ObjectMapper json;

    @Scheduled(fixedDelayString = "${ticketia.outbox.interval-ms:250}")
    @Transactional(rollbackFor = Exception.class)
    public void publishNext() throws Exception {
        var pending = outbox.lockNextPending();
        if (pending.isEmpty()) {
            return;
        }

        var event = pending.get();
        var message = MessageBuilder.withBody(json.writeValueAsBytes(TicketReceived.from(event)))
                .setContentType("application/json")
                .setDeliveryMode(MessageDeliveryMode.PERSISTENT)
                .setMessageId(event.getEventId().toString())
                .build();
        var correlation = new CorrelationData(message.getMessageProperties().getMessageId());
        rabbit.send("", TicketReceived.ROUTING_KEY, message, correlation);
        var confirmation = correlation.getFuture().get(5, TimeUnit.SECONDS);
        if (!confirmation.ack() || correlation.getReturned() != null) {
            throw new IllegalStateException("Broker did not confirm routing the ticket event");
        }
        event.markPublished();
    }
}
