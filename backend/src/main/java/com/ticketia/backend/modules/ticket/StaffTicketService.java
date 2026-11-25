package com.ticketia.backend.modules.ticket;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.ticketia.backend.config.security.StaffAccess;
import com.ticketia.backend.modules.department.Department;
import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.Classification;
import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.Detail;
import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.RoutingChange;
import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.Summary;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
class StaffTicketService {

    private static final int PAGE_SIZE = 20;

    private final TicketRepository tickets;
    private final ClassificationRepository classifications;
    private final TicketRoutingHistoryRepository history;

    @Transactional(readOnly = true)
    public Page<Summary> list(StaffAccess access, Department department, TicketStatus status, int page) {
        if (page < 1 || page > Integer.MAX_VALUE / PAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe uma página válida.");
        }

        return tickets.findStaffQueue(access.reviewer(), code(access.department()), code(department), status,
                PageRequest.of(page - 1, PAGE_SIZE));
    }

    @Transactional(readOnly = true)
    public Detail detail(StaffAccess access, UUID protocol) {
        var ticket = tickets.findById(protocol).filter(candidate -> access.canAccess(candidate.getDepartment()))
                .orElseThrow(this::notFound);
        var classification = classifications.findById(protocol).orElse(null);
        var changes = history.findAllByProtocolOrderByIdDesc(protocol).stream()
                .map(change -> new RoutingChange(change.getChangedBy(), change.getChangedAt(),
                        change.getPreviousDepartment(), change.getNewDepartment()))
                .toList();

        return new Detail(summary(ticket, classification), ticket.getOriginalMessage(),
                classification == null ? null : new Classification(classification.getCategory(),
                        classification.getPriority(), classification.getSubject(), classification.getReviewReason()),
                changes);
    }

    @Transactional
    public void route(StaffAccess access, UUID protocol, Department department) {
        var ticket = tickets.findByProtocol(protocol).filter(candidate -> access.canAccess(candidate.getDepartment()))
                .orElseThrow(this::notFound);
        String destination = department.name();
        if (destination.equals(ticket.getDepartment()) && ticket.getStatus() == TicketStatus.ROUTED) {
            return;
        }

        history.save(new TicketRoutingChange(protocol, access.username(), ticket.getDepartment(), destination));
        ticket.setDepartment(destination);
        ticket.setStatus(TicketStatus.ROUTED);
    }

    private Summary summary(TicketEntity ticket, TicketClassification classification) {
        return new Summary(ticket.getProtocol(), ticket.getStatus(), ticket.getDepartment(), ticket.getCreatedAt(),
                classification == null ? null : classification.getSubject(),
                classification == null ? null : classification.getPriority());
    }

    private String code(Department department) {
        return department == null ? null : department.name();
    }

    private ResponseStatusException notFound() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Atendimento não encontrado.");
    }
}
