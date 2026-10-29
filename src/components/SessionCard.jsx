import StarRating from "./StarRating";
import { SESSION_STATUS } from "../data/dummySessions";
import {
  getSessionDateTime,
  formatSessionDate,
  formatSessionTime,
} from "../utils/dateUtils";
import "./SkillManager.css";
import "./RequestCard.css";
import "./SessionCard.css";

const STATUS_LABELS = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

function ReviewBlock({ title, review }) {
  return (
    <div className="review-block">
      <div className="review-block-header">
        <p className="review-block-title">{title}</p>
        <StarRating value={review.rating} />
      </div>
      {review.comment && <p className="review-block-comment">{review.comment}</p>}
      <p className="review-block-date">
        Reviewed on {formatSessionDate(review.createdAt)}
      </p>
    </div>
  );
}

function SessionCard({
  session,
  currentUserId,
  partnerName,
  myReview,
  partnerReview,
  onComplete,
  onCancel,
  onReview,
}) {
  const isTeaching = session.teacherId === currentUserId;
  const isScheduled = session.status === SESSION_STATUS.SCHEDULED;
  const isCompleted = session.status === SESSION_STATUS.COMPLETED;
  const hasStarted = getSessionDateTime(session.date, session.time) <= new Date();

  const title = isTeaching
    ? `Teaching ${session.skill} to ${partnerName}`
    : `Learning ${session.skill} from ${partnerName}`;

  return (
    <div className="request-card">
      <div className="request-header">
        <div>
          <p className="request-title">{title}</p>
          <p className="request-date">
            {isTeaching ? "You are the teacher" : "You are the learner"}
          </p>
        </div>
        <span
          className={`status-badge status-${session.status.toLowerCase()}`}
        >
          {STATUS_LABELS[session.status]}
        </span>
      </div>

      <div className="session-details">
        <div>
          <p className="session-detail-label">Date</p>
          <p className="session-detail-value">{formatSessionDate(session.date)}</p>
        </div>
        <div>
          <p className="session-detail-label">Time</p>
          <p className="session-detail-value">
            {formatSessionTime(session.date, session.time)}
          </p>
        </div>
        <div>
          <p className="session-detail-label">Duration</p>
          <p className="session-detail-value">{session.durationMinutes} min</p>
        </div>
        <div>
          <p className="session-detail-label">Skill</p>
          <div className="skill-chips">
            <span className={`skill-chip ${isTeaching ? "teach" : "learn"}`}>
              {session.skill}
            </span>
          </div>
        </div>
      </div>

      {session.notes && <p className="request-message">{session.notes}</p>}

      {isScheduled && (
        <>
          <div className="request-actions">
            {hasStarted && (
              <button
                type="button"
                className="request-button btn-accept"
                onClick={() => onComplete(session.id)}
              >
                Mark as completed
              </button>
            )}
            <button
              type="button"
              className="request-button btn-cancel"
              onClick={() => onCancel(session.id)}
            >
              Cancel session
            </button>
          </div>
          {!hasStarted && (
            <p className="session-hint">
              You can mark this session as completed after the session time.
            </p>
          )}
        </>
      )}

      {isCompleted && (
        <div className="review-section">
          {myReview ? (
            <ReviewBlock title="Your review" review={myReview} />
          ) : (
            <button
              type="button"
              className="request-button btn-review"
              onClick={() => onReview(session)}
            >
              ★ Write a review
            </button>
          )}

          {partnerReview && (
            <ReviewBlock
              title={`${partnerName}'s review`}
              review={partnerReview}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default SessionCard;