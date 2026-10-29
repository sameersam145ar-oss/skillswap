package com.skillswap.backend.controller;

import com.skillswap.backend.model.SwapRequest;
import com.skillswap.backend.security.AuthenticatedUser;
import com.skillswap.backend.service.SwapRequestService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/swap-requests")
public class SwapRequestController {

    @Autowired
    private SwapRequestService swapRequestService;

    @GetMapping
    public List<SwapRequest> getAllSwapRequests(@AuthenticationPrincipal Jwt principal) {
        Long userId = AuthenticatedUser.id(principal);
        return java.util.stream.Stream.concat(
                        swapRequestService.getRequestsBySender(userId).stream(),
                        swapRequestService.getRequestsByReceiver(userId).stream())
                .distinct()
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SwapRequest> getSwapRequestById(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        return swapRequestService.getSwapRequestById(id)
                .filter(request -> request.getSender().getId().equals(AuthenticatedUser.id(principal))
                        || request.getReceiver().getId().equals(AuthenticatedUser.id(principal)))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/sender/{senderId}")
    public ResponseEntity<?> getRequestsBySender(
            @PathVariable Long senderId,
            @AuthenticationPrincipal Jwt principal) {
        if (!senderId.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(swapRequestService.getRequestsBySender(senderId));
    }

    @GetMapping("/receiver/{receiverId}")
    public ResponseEntity<?> getRequestsByReceiver(
            @PathVariable Long receiverId,
            @AuthenticationPrincipal Jwt principal) {
        if (!receiverId.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(swapRequestService.getRequestsByReceiver(receiverId));
    }

    @PostMapping
    public ResponseEntity<?> createSwapRequest(
            @Valid @RequestBody CreateSwapRequest request,
            @AuthenticationPrincipal Jwt principal) {
        if (!request.senderId().equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(swapRequestService.createSwapRequest(
                    request.senderId(), request.receiverId(), request.offeredSkillId(),
                    request.requestedSkillId(), request.message()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    public record CreateSwapRequest(
            @NotNull Long senderId,
            @NotNull Long receiverId,
            @NotNull Long offeredSkillId,
            @NotNull Long requestedSkillId,
            String message) {}

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateSwapRequestStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @AuthenticationPrincipal Jwt principal) {
        try {
            SwapRequest updatedRequest = swapRequestService.updateSwapRequestStatus(
                    id, status, AuthenticatedUser.id(principal));
            return ResponseEntity.ok(updatedRequest);
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSwapRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        try {
            swapRequestService.deleteSwapRequest(id, AuthenticatedUser.id(principal));
            return ResponseEntity.ok().build();
        } catch (AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(e.getMessage());
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
}