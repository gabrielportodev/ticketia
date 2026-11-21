package com.ticketia.backend.modules.ticket;

import org.springframework.stereotype.Component;

import com.ticketia.backend.modules.ticket.dtos.CreateTicketRequest;
import com.ticketia.backend.modules.ticket.dtos.CreateTicketResponse;

@Component
public class TicketMapper {

    public TicketEntity toEntity(CreateTicketRequest request) {
        return new TicketEntity(request.message());
    }

    public CreateTicketResponse toResponse(TicketEntity ticket) {
        return new CreateTicketResponse(ticket.getProtocol(), ticket.getStatus(), ticket.getCreatedAt());
    }
}
