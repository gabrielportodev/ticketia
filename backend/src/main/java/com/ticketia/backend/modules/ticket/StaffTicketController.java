package com.ticketia.backend.modules.ticket;

import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.ticketia.backend.config.security.StaffAccess;
import com.ticketia.backend.modules.department.Department;
import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.Detail;
import com.ticketia.backend.modules.ticket.dtos.StaffTicketResponses.Summary;
import com.ticketia.backend.shared.dtos.ApiResponse;
import com.ticketia.backend.shared.dtos.ResponseMeta;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/staff/tickets")
@RequiredArgsConstructor
public class StaffTicketController {

    private final StaffTicketService tickets;

    @GetMapping
    ApiResponse<List<Summary>> list(Authentication authentication,
            @RequestParam(required = false) Department department,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(defaultValue = "1") int page) {
        var result = tickets.list(StaffAccess.from(authentication), department, status, page);
        var meta = ResponseMeta.builder().currentPage(page).perPage(result.getSize())
                .lastPage(result.getTotalPages()).total(result.getTotalElements()).build();
        return ApiResponse.success(result.getContent(), "Atendimentos consultados.", meta, null);
    }

    @GetMapping("/{protocol}")
    ApiResponse<Detail> detail(Authentication authentication, @PathVariable UUID protocol) {
        return ApiResponse.success(tickets.detail(StaffAccess.from(authentication), protocol), "Atendimento consultado.");
    }

    @PatchMapping("/{protocol}/routing")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void route(Authentication authentication, @PathVariable UUID protocol,
            @Valid @RequestBody RouteRequest request) {
        tickets.route(StaffAccess.from(authentication), protocol, request.department());
    }

    record RouteRequest(@NotNull Department department) {
    }
}
