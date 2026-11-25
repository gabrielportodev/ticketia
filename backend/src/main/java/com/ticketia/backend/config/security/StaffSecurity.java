package com.ticketia.backend.config.security;

import java.io.IOException;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

import com.ticketia.backend.shared.dtos.ApiResponse;

import tools.jackson.databind.ObjectMapper;

@Configuration(proxyBeanMethods = false)
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
class StaffSecurity {

    @Bean
    @Order(1)
    SecurityFilterChain staffSecurityFilterChain(HttpSecurity http, ObjectMapper json, StaffAccounts accounts) {
        return http
                .securityMatcher("/staff/**")
                .authenticationManager(accounts.authenticationManager())
                .requestCache(cache -> cache.disable())
                .authorizeHttpRequests(access -> access
                        .requestMatchers(HttpMethod.GET, "/staff/csrf").permitAll()
                        .requestMatchers(HttpMethod.POST, "/staff/login").permitAll()
                        .anyRequest().hasAuthority(StaffAccess.STAFF))
                .formLogin(login -> login
                        .loginPage("/staff/login")
                        .loginProcessingUrl("/staff/login")
                        .successHandler((request, response, authentication) -> response.setStatus(204))
                        .failureHandler((request, response, failure) ->
                                reject(response, json, HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos.")))
                .logout(logout -> logout
                        .logoutUrl("/staff/logout")
                        .logoutSuccessHandler((request, response, authentication) -> response.setStatus(204)))
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, failure) ->
                                reject(response, json, HttpStatus.UNAUTHORIZED, "Entre para acessar a fila."))
                        .accessDeniedHandler((request, response, failure) ->
                                reject(response, json, HttpStatus.FORBIDDEN, "Solicitação não autorizada.")))
                .build();
    }

    private void reject(HttpServletResponse response, ObjectMapper json, HttpStatus status, String message)
            throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        json.writeValue(response.getOutputStream(), ApiResponse.error(message));
    }
}
