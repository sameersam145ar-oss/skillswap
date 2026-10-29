package com.skillswap.backend.security;

import org.springframework.security.oauth2.jwt.Jwt;

public final class AuthenticatedUser {

    private AuthenticatedUser() {}

    public static Long id(Jwt principal) {
        return Long.valueOf(principal.getSubject());
    }
}
