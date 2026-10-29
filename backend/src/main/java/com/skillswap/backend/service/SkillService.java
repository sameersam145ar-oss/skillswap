package com.skillswap.backend.service;

import com.skillswap.backend.model.Skill;
import com.skillswap.backend.repository.UserRepository;
import com.skillswap.backend.repository.SkillRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SkillService {

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    public Optional<Skill> getSkillById(Long id) {
        return skillRepository.findById(id);
    }

    public List<Skill> getSkillsByUserId(Long userId) {
        return skillRepository.findByUserId(userId);
    }

    public Skill createSkill(Skill skill) {
        validateCategory(skill.getCategory());
        skill.setUser(userRepository.getReferenceById(skill.getUser().getId()));
        return skillRepository.save(skill);
    }

    public Skill updateSkill(Long id, Skill skillDetails, Long actorId) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + id));
        if (!skill.getUser().getId().equals(actorId)) {
            throw new AccessDeniedException("Only the skill owner can update it");
        }
        validateCategory(skillDetails.getCategory());
        skill.setTitle(skillDetails.getTitle());
        skill.setDescription(skillDetails.getDescription());
        skill.setCategory(skillDetails.getCategory());
        return skillRepository.save(skill);
    }

    public void deleteSkill(Long id, Long actorId) {
        Skill skill = skillRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Skill not found with id: " + id));
        if (!skill.getUser().getId().equals(actorId)) {
            throw new AccessDeniedException("Only the skill owner can delete it");
        }
        skillRepository.delete(skill);
    }

    private void validateCategory(String category) {
        if (!"TEACH".equals(category) && !"LEARN".equals(category)) {
            throw new IllegalArgumentException("Skill category must be TEACH or LEARN");
        }
    }
}