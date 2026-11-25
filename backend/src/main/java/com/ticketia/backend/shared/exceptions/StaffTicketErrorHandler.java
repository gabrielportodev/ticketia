package com.ticketia.backend.shared.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;

import com.ticketia.backend.modules.ticket.StaffTicketController;
import com.ticketia.backend.shared.dtos.ApiResponse;

@RestControllerAdvice(assignableTypes = StaffTicketController.class)
class StaffTicketErrorHandler {

    @ExceptionHandler(ResponseStatusException.class)
    ResponseEntity<ApiResponse<Void>> handleStatus(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).body(ApiResponse.error(error.getReason()));
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, HttpMessageNotReadableException.class})
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiResponse<Void> handleInvalidDepartment() {
        return ApiResponse.error("Informe um setor de destino válido.");
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    ApiResponse<Void> handleInvalidParameter() {
        return ApiResponse.error("Verifique os filtros ou o protocolo informado.");
    }
}
