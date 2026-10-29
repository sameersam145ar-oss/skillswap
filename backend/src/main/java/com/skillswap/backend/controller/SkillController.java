package com.skillswap.backend.controller;

import com.skillswap.backend.model.Skill;
import com.skillswap.backend.security.AuthenticatedUser;
import com.skillswap.backend.service.SkillService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/skills")
public class SkillController {

    @Autowired
    private SkillService skillService;

    @GetMapping
    public List<Skill> getAllSkills() {
        return skillService.getAllSkills();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(@PathVariable Long id) {
        return skillService.getSkillById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    public List<Skill> getSkillsByUserId(@PathVariable Long userId) {
        return skillService.getSkillsByUserId(userId);
    }

    @PostMapping
    public ResponseEntity<?> createSkill(
            @Valid @RequestBody Skill skill,
            @AuthenticationPrincipal Jwt principal) {
        if (skill.getId() != null) {
            return ResponseEntity.badRequest().body("A new skill cannot include an id");
        }
        if (skill.getUser() == null || skill.getUser().getId() == null
                || !skill.getUser().getId().equals(AuthenticatedUser.id(principal))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            return ResponseEntity.ok(skillService.createSkill(skill));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSkill(
            @PathVariable Long id,
            @RequestBody Skill skillDetails,
            @AuthenticationPrincipal Jwt principal) {
        try {
            Skill updatedSkill = skillService.updateSkill(
                    id, skillDetails, AuthenticatedUser.id(principal));
            return ResponseEntity.ok(updatedSkill);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSkill(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt principal) {
        try {
            skillService.deleteSkill(id, AuthenticatedUser.id(principal));
            return ResponseEntity.ok().build();
        } catch (org.springframework.security.access.AccessDeniedException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}