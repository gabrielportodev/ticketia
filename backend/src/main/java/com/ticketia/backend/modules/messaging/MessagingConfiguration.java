package com.ticketia.backend.modules.messaging;

import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration(proxyBeanMethods = false)
@Profile({"publisher", "worker"})
@EnableScheduling
class MessagingConfiguration {

    @Bean
    Queue ticketReceivedQueue() {
        return new Queue(TicketReceived.ROUTING_KEY, true);
    }
}
