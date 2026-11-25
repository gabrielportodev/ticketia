package com.ticketia.backend.modules.ticket;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

interface TicketRoutingHistoryRepository extends JpaRepository<TicketRoutingChange, Long> {

    List<TicketRoutingChange> findAllByProtocolOrderByIdDesc(UUID protocol);
}
