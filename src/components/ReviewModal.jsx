import { useState, useEffect } from "react";
import StarRating from "./StarRating";
import { formatSessionDate } from "../utils/dateUtils";
import "../pages/Auth.css";
import "./SendRequestModal.css";

const COMMENT_MAX_LENGTH = 300;

const RATING_LABELS = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

function ReviewModal({ session, partnerName, onClose, onSubmit }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleRatingChange = (value) => {
    setRating(value);
    setErrors({ ...errors, rating: "" });
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
    setErrors({ ...errors, comment: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (rating < 1 || rating > 5) {
      newErrors.rating = "Select a rating from 1 to 5 stars";
    }

    if (comment.length > COMMENT_MAX_LENGTH) {
      newErrors.comment = `Review must be ${COMMENT_MAX_LENGTH} characters or less`;
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({ rating, comment: comment.trim() });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title" id="review-title">
              Review {partnerName}
            </h3>
            <p className="modal-subtitle">
              {session.skill} session on {formatSessionDate(session.date)}
            </p>
          </div>
          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label>Your rating</label>
            <StarRating
              value={rating}
              onChange={handleRatingChange}
              label="Your rating"
            />
            {rating > 0 && <p className="rating-label">{RATING_LABELS[rating]}</p>}
            {errors.rating && <p className="error-text">{errors.rating}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="comment">Review (optional)</label>
            <textarea
              id="comment"
              name="comment"
              rows="4"
              value={comment}
              onChange={handleCommentChange}
              placeholder={`How was your session with ${partnerName}?`}
              className={errors.comment ? "input-error" : ""}
            />
            <p className="char-count">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </p>
            {errors.comment && <p className="error-text">{errors.comment}</p>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="modal-submit-button">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReviewModal;