package com.skillswap.backend.service;

import com.skillswap.backend.model.Skill;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.SkillRepository;
import com.skillswap.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class ProfileService {

    private static final int MAX_SKILLS_PER_CATEGORY = 10;

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    public ProfileService(UserRepository userRepository, SkillRepository skillRepository) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
    }

    @Transactional
    public ProfileResult update(
            Long userId,
            String name,
            String bio,
            String location,
            List<SkillInput> requestedSkills) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new java.util.NoSuchElementException("User not found"));
        validateSkills(requestedSkills);

        user.setName(name.trim());
        user.setBio(bio == null ? "" : bio.trim());
        user.setLocation(location == null ? "" : location.trim());
        userRepository.save(user);

        List<Skill> existingSkills = skillRepository.findByUserId(userId);
        Set<String> requestedKeys = requestedSkills.stream()
                .map(skill -> key(skill.category(), skill.title()))
                .collect(java.util.stream.Collectors.toSet());
        List<Skill> removedSkills = existingSkills.stream()
                .filter(skill -> !requestedKeys.contains(key(skill.getCategory(), skill.getTitle())))
                .toList();
        skillRepository.deleteAll(removedSkills);

        Set<String> existingKeys = existingSkills.stream()
                .map(skill -> key(skill.getCategory(), skill.getTitle()))
                .collect(java.util.stream.Collectors.toSet());
        List<Skill> addedSkills = requestedSkills.stream()
                .filter(skill -> !existingKeys.contains(key(skill.category(), skill.title())))
                .map(skill -> new Skill(skill.title().trim(), "", skill.category(), user))
                .toList();
        skillRepository.saveAll(addedSkills);

        return new ProfileResult(user, skillRepository.findByUserId(userId));
    }

    private void validateSkills(List<SkillInput> skills) {
        Set<String> uniqueSkills = new HashSet<>();
        long teachCount = 0;
        long learnCount = 0;
        for (SkillInput skill : skills) {
            String normalizedTitle = skill.title().trim().toLowerCase();
            if (!uniqueSkills.add(key(skill.category(), normalizedTitle))) {
                throw new IllegalArgumentException("Duplicate skills are not allowed");
            }
            if ("TEACH".equals(skill.category())) {
                teachCount++;
            } else {
                learnCount++;
            }
        }
        if (teachCount > MAX_SKILLS_PER_CATEGORY || learnCount > MAX_SKILLS_PER_CATEGORY) {
            throw new IllegalArgumentException("You can add up to 10 skills per category");
        }
    }

    private String key(String category, String title) {
        return category + ":" + title.trim().toLowerCase();
    }

    public record SkillInput(String title, String category) {}

    public record ProfileResult(User user, List<Skill> skills) {}
}
