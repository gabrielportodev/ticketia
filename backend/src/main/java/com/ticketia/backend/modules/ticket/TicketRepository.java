package com.ticketia.backend.modules.ticket;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

public interface TicketRepository extends JpaRepository<TicketEntity, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TicketEntity> findByProtocol(UUID protocol);
}
