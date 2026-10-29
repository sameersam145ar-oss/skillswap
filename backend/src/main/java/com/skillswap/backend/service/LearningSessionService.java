package com.skillswap.backend.service;

import com.skillswap.backend.model.LearningSession;
import com.skillswap.backend.model.Skill;
import com.skillswap.backend.model.SwapRequest;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.LearningSessionRepository;
import com.skillswap.backend.repository.SkillRepository;
import com.skillswap.backend.repository.SwapRequestRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LearningSessionService {

    private final LearningSessionRepository sessionRepository;
    private final SwapRequestRepository requestRepository;
    private final SkillRepository skillRepository;
    private final UserRepository userRepository;

    public LearningSessionService(
            LearningSessionRepository sessionRepository,
            SwapRequestRepository requestRepository,
            SkillRepository skillRepository,
            UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.requestRepository = requestRepository;
        this.skillRepository = skillRepository;
        this.userRepository = userRepository;
    }

    public List<LearningSession> getSessionsForUser(Long userId) {
        return sessionRepository.findByTeacherIdOrLearnerId(userId, userId);
    }

    public Optional<LearningSession> getSession(Long id) {
        return sessionRepository.findById(id);
    }

    public LearningSession createSession(
            Long requestId, Long skillId, Long teacherId, Long learnerId,
            java.time.LocalDate date, java.time.LocalTime time,
            Integer durationMinutes, String notes) {
        SwapRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Accepted exchange request not found"));
        if (!"ACCEPTED".equals(request.getStatus())) {
            throw new IllegalArgumentException("A session requires an accepted exchange request");
        }

        User sender = request.getSender();
        User receiver = request.getReceiver();
        boolean participantsMatch =
                (sender.getId().equals(teacherId) && receiver.getId().equals(learnerId))
                        || (receiver.getId().equals(teacherId) && sender.getId().equals(learnerId));
        if (!participantsMatch) {
            throw new IllegalArgumentException("Session participants must belong to the exchange request");
        }

        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> new IllegalArgumentException("Skill not found"));
        boolean skillBelongsToExchange =
                (request.getOfferedSkill().getId().equals(skillId)
                        && sender.getId().equals(teacherId) && receiver.getId().equals(learnerId))
                        || (request.getRequestedSkill().getId().equals(skillId)
                        && receiver.getId().equals(teacherId) && sender.getId().equals(learnerId));
        if (!skillBelongsToExchange || !skill.getUser().getId().equals(teacherId)
                || !"TEACH".equals(skill.getCategory())) {
            throw new IllegalArgumentException("The session skill must be taught by its teacher in this exchange");
        }
        if (!LocalDateTime.of(date, time).isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Session time must be in the future");
        }
        if (durationMinutes == null || durationMinutes < 1 || durationMinutes > 480) {
            throw new IllegalArgumentException("Session duration must be between 1 and 480 minutes");
        }

        LearningSession session = new LearningSession();
        session.setRequest(request);
        session.setSkill(skill);
        session.setTeacher(userRepository.getReferenceById(teacherId));
        session.setLearner(userRepository.getReferenceById(learnerId));
        session.setDate(date);
        session.setTime(time);
        session.setDurationMinutes(durationMinutes);
        session.setNotes(notes);
        return sessionRepository.save(session);
    }

    public LearningSession updateStatus(Long id, String status, Long actorId) {
        LearningSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!session.getTeacher().getId().equals(actorId)
                && !session.getLearner().getId().equals(actorId)) {
            throw new AccessDeniedException("Only session participants can change its status");
        }
        if (!"SCHEDULED".equals(session.getStatus())
                || !List.of("COMPLETED", "CANCELLED").contains(status)) {
            throw new IllegalArgumentException("Invalid session status transition");
        }
        if ("COMPLETED".equals(status)
                && !LocalDateTime.of(session.getDate(), session.getTime()).isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("A future session cannot be marked completed");
        }
        session.setStatus(status);
        return sessionRepository.save(session);
    }
}
