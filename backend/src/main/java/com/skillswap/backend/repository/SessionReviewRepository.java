package com.skillswap.backend.repository;

import com.skillswap.backend.model.SessionReview;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SessionReviewRepository extends JpaRepository<SessionReview, Long> {
    List<SessionReview> findByReviewerIdOrRevieweeId(Long reviewerId, Long revieweeId);
    List<SessionReview> findBySessionId(Long sessionId);
    boolean existsBySessionIdAndReviewerId(Long sessionId, Long reviewerId);
}
