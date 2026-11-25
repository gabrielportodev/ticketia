package com.ticketia.backend.modules.ticket;

import java.util.Optional;
import java.util.UUID;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.Summary;

public interface TicketRepository extends JpaRepository<TicketEntity, UUID> {

    @Query("""
            SELECT new com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses$Summary(
                ticket.protocol, ticket.status, ticket.department, ticket.createdAt,
                classification.subject, classification.priority)
            FROM TicketEntity ticket
            LEFT JOIN TicketClassification classification ON classification.protocol = ticket.protocol
            WHERE (:reviewer = true OR ticket.department = :ownDepartment)
                AND (:department IS NULL OR ticket.department = :department)
                AND (:status IS NULL OR ticket.status = :status)
            ORDER BY ticket.createdAt DESC, ticket.protocol DESC
            """)
    Page<Summary> findStaffQueue(@Param("reviewer") boolean reviewer,
            @Param("ownDepartment") String ownDepartment, @Param("department") String department,
            @Param("status") TicketStatus status, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<TicketEntity> findByProtocol(UUID protocol);
}
