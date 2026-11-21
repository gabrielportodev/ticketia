package com.ticketia.backend.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.servlet.util.matcher.PathPatternRequestMatcher;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) {
        var createTicket = PathPatternRequestMatcher.withDefaults()
                .matcher(HttpMethod.POST, "/tickets");

        return http
                .csrf(csrf -> csrf.ignoringRequestMatchers(createTicket))
                .authorizeHttpRequests(access -> access
                        .requestMatchers(createTicket).permitAll()
                        .anyRequest().authenticated())
                .httpBasic(Customizer.withDefaults())
                .formLogin(Customizer.withDefaults())
                .build();
    }
}
