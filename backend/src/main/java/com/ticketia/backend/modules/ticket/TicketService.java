package com.ticketia.backend.modules.ticket;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ticketia.backend.modules.messaging.TicketOutboxEvent;
import com.ticketia.backend.modules.messaging.TicketOutboxRepository;
import com.ticketia.backend.modules.ticket.dtos.CreateTicketRequest;
import com.ticketia.backend.modules.ticket.dtos.CreateTicketResponse;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketOutboxRepository outbox;
    private final TicketMapper ticketMapper;

    @Transactional
    public CreateTicketResponse create(CreateTicketRequest request) {
        TicketEntity ticket = ticketRepository.saveAndFlush(ticketMapper.toEntity(request));
        outbox.save(new TicketOutboxEvent(ticket.getProtocol(), ticket.getCreatedAt()));
        return ticketMapper.toResponse(ticket);
    }
}
