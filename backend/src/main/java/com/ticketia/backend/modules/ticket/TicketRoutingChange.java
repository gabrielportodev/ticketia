package com.ticketia.backend.modules.ticket;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ticket_routing_history")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
class TicketRoutingChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private UUID protocol;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    @Column(name = "changed_at", nullable = false)
    private Instant changedAt;

    @Column(name = "previous_department")
    private String previousDepartment;

    @Column(name = "new_department", nullable = false)
    private String newDepartment;

    TicketRoutingChange(UUID protocol, String changedBy, String previousDepartment, String newDepartment) {
        this.protocol = protocol;
        this.changedBy = changedBy;
        this.changedAt = Instant.now();
        this.previousDepartment = previousDepartment;
        this.newDepartment = newDepartment;
    }
}
