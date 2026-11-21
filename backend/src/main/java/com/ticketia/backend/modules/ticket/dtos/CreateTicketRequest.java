package com.ticketia.backend.modules.ticket.dtos;

import jakarta.validation.constraints.NotBlank;

public record CreateTicketRequest(@NotBlank String message) {
}
