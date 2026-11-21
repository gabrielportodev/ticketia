package com.ticketia.backend.modules.ticket;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassificationRepository extends JpaRepository<TicketClassification, UUID> {
}
