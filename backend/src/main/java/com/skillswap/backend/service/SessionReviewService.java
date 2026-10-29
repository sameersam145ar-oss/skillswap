package com.skillswap.backend.service;

import com.skillswap.backend.model.LearningSession;
import com.skillswap.backend.model.SessionReview;
import com.skillswap.backend.model.User;
import com.skillswap.backend.repository.LearningSessionRepository;
import com.skillswap.backend.repository.SessionReviewRepository;
import com.skillswap.backend.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Service
public class SessionReviewService {

    private final SessionReviewRepository reviewRepository;
    private final LearningSessionRepository sessionRepository;
    private final UserRepository userRepository;

    public SessionReviewService(
            SessionReviewRepository reviewRepository,
            LearningSessionRepository sessionRepository,
            UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.sessionRepository = sessionRepository;
        this.userRepository = userRepository;
    }

    public List<SessionReview> getReviewsForUser(Long userId) {
        return reviewRepository.findByReviewerIdOrRevieweeId(userId, userId);
    }

    public List<SessionReview> getReviewsForSession(Long sessionId) {
        return reviewRepository.findBySessionId(sessionId);
    }

    public boolean isSessionParticipant(Long sessionId, Long userId) {
        return sessionRepository.findById(sessionId)
                .map(session -> session.getTeacher().getId().equals(userId)
                        || session.getLearner().getId().equals(userId))
                .orElse(false);
    }

    public Map<Long, RatingSummary> getRatingSummaries() {
        Map<Long, long[]> totals = new HashMap<>();
        for (SessionReview review : reviewRepository.findAll()) {
            long[] summary = totals.computeIfAbsent(review.getReviewee().getId(), ignored -> new long[2]);
            summary[0] += review.getRating();
            summary[1]++;
        }
        Map<Long, RatingSummary> summaries = new HashMap<>();
        totals.forEach((userId, total) ->
                summaries.put(userId, new RatingSummary((double) total[0] / total[1], total[1])));
        return summaries;
    }

    public SessionReview createReview(Long sessionId, Long reviewerId, Integer rating, String comment) {
        LearningSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        if (!"COMPLETED".equals(session.getStatus())) {
            throw new IllegalArgumentException("Only completed sessions can be reviewed");
        }

        User reviewer;
        User reviewee;
        if (session.getTeacher().getId().equals(reviewerId)) {
            reviewer = session.getTeacher();
            reviewee = session.getLearner();
        } else if (session.getLearner().getId().equals(reviewerId)) {
            reviewer = session.getLearner();
            reviewee = session.getTeacher();
        } else {
            throw new AccessDeniedException("Only session participants can submit a review");
        }
        if (reviewRepository.existsBySessionIdAndReviewerId(sessionId, reviewerId)) {
            throw new IllegalArgumentException("You have already reviewed this session");
        }
        if (rating == null || rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be from 1 to 5");
        }

        SessionReview review = new SessionReview();
        review.setSession(session);
        review.setReviewer(userRepository.getReferenceById(reviewer.getId()));
        review.setReviewee(userRepository.getReferenceById(reviewee.getId()));
        review.setRating(rating);
        review.setComment(comment);
        return reviewRepository.save(review);
    }

    public record RatingSummary(double average, long count) {}
}
