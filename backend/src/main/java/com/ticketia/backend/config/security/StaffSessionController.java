package com.ticketia.backend.config.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ticketia.backend.modules.department.Department;
import com.ticketia.backend.shared.dtos.ApiResponse;

@RestController
@RequestMapping("/staff")
class StaffSessionController {

    @GetMapping("/csrf")
    ApiResponse<CsrfResponse> csrf(CsrfToken csrf) {
        return ApiResponse.success(new CsrfResponse(csrf.getHeaderName(), csrf.getToken()), "Token de segurança.");
    }

    @GetMapping("/session")
    ApiResponse<SessionResponse> session(Authentication authentication) {
        var access = StaffAccess.from(authentication);
        return ApiResponse.success(new SessionResponse(access.username(), access.department(), access.reviewer()),
                "Sessão do atendente.");
    }

    record CsrfResponse(String header, String token) {
    }

    record SessionResponse(String username, Department department, boolean reviewer) {
    }
}
