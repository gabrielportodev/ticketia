package com.ticketia.backend.config.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

import com.ticketia.backend.modules.department.Department;

public record StaffAccess(String username, Department department, boolean reviewer) {

    static final String STAFF = "ROLE_STAFF";
    static final String REVIEWER = "ROLE_REVIEWER";
    static final String DEPARTMENT_PREFIX = "DEPARTMENT_";

    public static StaffAccess from(Authentication authentication) {
        var authorities = authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList();
        var department = authorities.stream()
                .filter(authority -> authority.startsWith(DEPARTMENT_PREFIX))
                .map(authority -> Department.valueOf(authority.substring(DEPARTMENT_PREFIX.length())))
                .findFirst().orElse(null);
        return new StaffAccess(authentication.getName(), department, authorities.contains(REVIEWER));
    }

    public boolean canAccess(String ticketDepartment) {
        return reviewer || (department != null && department.name().equals(ticketDepartment));
    }
}
