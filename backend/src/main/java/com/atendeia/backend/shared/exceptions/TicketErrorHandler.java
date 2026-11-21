package com.atendeia.backend.shared.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.atendeia.backend.modules.ticket.TicketController;
import com.atendeia.backend.shared.dtos.ApiResponse;

@RestControllerAdvice(assignableTypes = TicketController.class)
public class TicketErrorHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleInvalidMessage() {
        return ApiResponse.error("A mensagem é obrigatória.");
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiResponse<Void> handleUnreadableBody() {
        return ApiResponse.error("Envie um corpo JSON válido com o campo message.");
    }
}
