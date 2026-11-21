package com.atendeia.backend.modules.ticket;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.atendeia.backend.modules.ticket.dtos.CreateTicketRequest;
import com.atendeia.backend.modules.ticket.dtos.CreateTicketResponse;
import com.atendeia.backend.shared.dtos.ApiResponse;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping
    public ResponseEntity<ApiResponse<CreateTicketResponse>> create(
            @Valid @RequestBody CreateTicketRequest request) {
        CreateTicketResponse ticket = ticketService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ticket, "Atendimento registrado."));
    }
}
