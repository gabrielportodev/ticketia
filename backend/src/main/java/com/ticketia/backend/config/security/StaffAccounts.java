package com.ticketia.backend.config.security;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.stereotype.Component;

import com.ticketia.backend.modules.department.Department;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
@ConditionalOnWebApplication(type = ConditionalOnWebApplication.Type.SERVLET)
class StaffAccounts {

    private final AuthenticationManager authenticationManager;

    StaffAccounts(ObjectMapper json, @Value("${ticketia.staff.users}") String configuration) {
        var passwordEncoder = new BCryptPasswordEncoder();
        var users = loadUsers(json, configuration, passwordEncoder);
        var provider = new DaoAuthenticationProvider(new InMemoryUserDetailsManager(users));
        provider.setPasswordEncoder(passwordEncoder);
        authenticationManager = new ProviderManager(provider);
    }

    AuthenticationManager authenticationManager() {
        return authenticationManager;
    }

    private List<UserDetails> loadUsers(ObjectMapper json, String configuration, PasswordEncoder passwordEncoder) {
        Account[] accounts;
        try {
            accounts = json.readValue(configuration, Account[].class);
        } catch (JacksonException invalid) {
            throw new IllegalStateException("TICKETIA_STAFF_USERS must contain a valid JSON array");
        }

        if (accounts == null) {
            throw new IllegalStateException("TICKETIA_STAFF_USERS must contain a JSON array");
        }

        var usernames = new HashSet<String>();
        var users = new ArrayList<UserDetails>();
        for (var account : accounts) {
            if (account == null) {
                throw new IllegalStateException("Invalid account in TICKETIA_STAFF_USERS");
            }

            boolean reviewer = Boolean.TRUE.equals(account.reviewer());
            if (account.username() == null
                    || !account.username().matches("[a-z0-9._-]{1,64}") || !usernames.add(account.username())
                    || account.password() == null || account.password().isBlank()
                    || reviewer == (account.department() != null)) {
                throw new IllegalStateException("Invalid or duplicate account in TICKETIA_STAFF_USERS");
            }

            String authority = reviewer ? StaffAccess.REVIEWER
                    : StaffAccess.DEPARTMENT_PREFIX + account.department().name();
            users.add(User.withUsername(account.username())
                    .password(passwordEncoder.encode(account.password()))
                    .authorities(StaffAccess.STAFF, authority)
                    .build());
        }
        return users;
    }

    private record Account(String username, String password, Department department, Boolean reviewer) {
    }
}
