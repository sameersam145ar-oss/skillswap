package com.skillswap.backend.controller;

import com.skillswap.backend.model.LearningSession;
import com.skillswap.backend.security.AuthenticatedUser;
import com.skillswap.backend.service.LearningSessionService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/sessions")
public class LearningSessionController {

    private final LearningSessionService sessionService;

    public LearningSessionController(LearningSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public ResponseEntity<?> getSessionsForUser(
            @RequestParam Long userId,
            @AuthenticationPrincipal Jwt principal) {
        if (!userId.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(sessionService.getSessionsForUser(userId));
    }

    @PostMapping
    public ResponseEntity<?> createSession(
            @Valid @RequestBody CreateSessionRequest request,
            @AuthenticationPrincipal Jwt principal) {
        Long userId = AuthenticatedUser.id(principal);
        if (!userId.equals(request.teacherId()) && !userId.equals(request.learnerId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            LearningSession session = sessionService.createSession(
                    request.requestId(), request.skillId(), request.teacherId(), request.learnerId(),
                    request.date(), request.time(), request.durationMinutes(), request.notes());
            return ResponseEntity.status(HttpStatus.CREATED).body(session);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal Jwt principal) {
        try {
            return ResponseEntity.ok(sessionService.updateStatus(
                    id, status, AuthenticatedUser.id(principal)));
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public record CreateSessionRequest(
            @NotNull Long requestId,
            @NotNull Long skillId,
            @NotNull Long teacherId,
            @NotNull Long learnerId,
            @NotNull LocalDate date,
            @NotNull LocalTime time,
            @NotNull Integer durationMinutes,
            String notes) {}
}
