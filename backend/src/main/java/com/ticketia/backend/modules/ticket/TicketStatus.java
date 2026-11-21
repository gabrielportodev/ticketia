package com.ticketia.backend.modules.ticket;

import com.fasterxml.jackson.annotation.JsonValue;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum TicketStatus {
    PENDING_TRIAGE("PENDENTE_TRIAGEM"),
    NEEDS_REVIEW("EM_REVISAO"),
    ROUTED("ENCAMINHADO");

    @Getter
    @JsonValue
    private final String responseValue;
}
