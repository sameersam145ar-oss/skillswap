package com.skillswap.backend.repository;

import com.skillswap.backend.model.LearningSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LearningSessionRepository extends JpaRepository<LearningSession, Long> {
    List<LearningSession> findByTeacherIdOrLearnerId(Long teacherId, Long learnerId);
}
