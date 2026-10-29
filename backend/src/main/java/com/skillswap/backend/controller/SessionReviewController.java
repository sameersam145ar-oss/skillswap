package com.skillswap.backend.controller;

import com.skillswap.backend.model.SessionReview;
import com.skillswap.backend.security.AuthenticatedUser;
import com.skillswap.backend.service.SessionReviewService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class SessionReviewController {

    private final SessionReviewService reviewService;

    public SessionReviewController(SessionReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/summary")
    public Map<Long, SessionReviewService.RatingSummary> getRatingSummaries() {
        return reviewService.getRatingSummaries();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getReviewsForUser(
            @PathVariable Long userId,
            @AuthenticationPrincipal Jwt principal) {
        if (!userId.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reviewService.getReviewsForUser(userId));
    }

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<?> getReviewsForSession(
            @PathVariable Long sessionId,
            @AuthenticationPrincipal Jwt principal) {
        if (!reviewService.isSessionParticipant(sessionId, AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(reviewService.getReviewsForSession(sessionId));
    }

    @PostMapping
    public ResponseEntity<?> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal Jwt principal) {
        try {
            SessionReview review = reviewService.createReview(
                    request.sessionId(), AuthenticatedUser.id(principal),
                    request.rating(), request.comment());
            return ResponseEntity.status(HttpStatus.CREATED).body(review);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public record CreateReviewRequest(
            @NotNull Long sessionId,
            @NotNull @Min(1) @Max(5) Integer rating,
            @Size(max = 300) String comment) {}
}
