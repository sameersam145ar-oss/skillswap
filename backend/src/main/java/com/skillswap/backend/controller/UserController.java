package com.skillswap.backend.controller;

import com.skillswap.backend.model.Skill;
import com.skillswap.backend.model.User;
import com.skillswap.backend.security.AuthenticatedUser;
import com.skillswap.backend.service.JwtTokenService;
import com.skillswap.backend.service.ProfileService;
import com.skillswap.backend.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody RegisterRequest request) {
        if (userService.getUserByEmail(request.email()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Email is already registered");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(request.email().trim());
        user.setPassword(request.password());
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest credentials) {
        return userService.authenticate(credentials.email(), credentials.password())
                .<ResponseEntity<?>>map(user -> {
                    JwtTokenService.Token token = jwtTokenService.createToken(user);
                    return ResponseEntity.ok(new LoginResponse(
                            user.getId(), user.getName(), user.getEmail(), user.getBio(),
                            user.getLocation(), token.value(), token.expiresInSeconds()));
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body("Invalid email or password"));
    }

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 254) String email,
            @NotBlank @Size(min = 8) String password) {}

    public record LoginResponse(
            Long id,
            String name,
            String email,
            String bio,
            String location,
            String accessToken,
            long expiresInSeconds) {}

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long id,
            @Valid @RequestBody ProfileUpdateRequest request,
            @AuthenticationPrincipal Jwt principal) {
        if (!id.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            ProfileService.ProfileResult result = profileService.update(
                    id, request.name(), request.bio(), request.location(),
                    request.skills().stream()
                            .map(skill -> new ProfileService.SkillInput(skill.title(), skill.category()))
                            .toList());
            return ResponseEntity.ok(new ProfileResponse(result.user(), result.skills()));
        } catch (java.util.NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("A skill used by an existing exchange cannot be removed");
        }
    }

    public record ProfileUpdateRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 300) String bio,
            @Size(max = 150) String location,
            @NotNull @Valid @Size(max = 20) List<SkillUpdate> skills) {}

    public record SkillUpdate(
            @NotBlank @Size(max = 30) String title,
            @NotBlank @Pattern(regexp = "TEACH|LEARN") String category) {}

    public record ProfileResponse(User user, List<Skill> skills) {}

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestBody User userDetails,
            @AuthenticationPrincipal Jwt principal) {
        if (!id.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            User updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        if (!id.equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        userService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}