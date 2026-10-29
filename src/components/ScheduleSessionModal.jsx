import { useState, useEffect } from "react";
import { getTodayString, getSessionDateTime } from "../utils/dateUtils";
import "../pages/Auth.css";
import "./SendRequestModal.css";

const NOTES_MAX_LENGTH = 200;
const DURATION_OPTIONS = [30, 45, 60, 90, 120];

function getUserName(users, userId) {
  const user = users.find((item) => item.id === userId);
  return user ? user.name : "Unknown user";
}

function getTopicOptions(request) {
  return [
    {
      key: "offered",
      skill: request.offeredSkill.title,
      skillId: request.offeredSkill.id,
      teacherId: request.sender.id,
      learnerId: request.receiver.id,
    },
    {
      key: "requested",
      skill: request.requestedSkill.title,
      skillId: request.requestedSkill.id,
      teacherId: request.receiver.id,
      learnerId: request.sender.id,
    },
  ];
}

function ScheduleSessionModal({
  acceptedExchanges,
  currentUser,
  users,
  onClose,
  onSubmit,
}) {
  const [formData, setFormData] = useState({
    requestId: "",
    topicKey: "",
    date: "",
    time: "",
    durationMinutes: "60",
    notes: "",
  });
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

  const selectedExchange = acceptedExchanges.find(
    (request) => request.id === Number(formData.requestId)
  );
  const topicOptions = selectedExchange ? getTopicOptions(selectedExchange) : [];

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "requestId") {
      setFormData({ ...formData, requestId: value, topicKey: "" });
      setErrors({ ...errors, requestId: "", topicKey: "" });
      return;
    }

    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.requestId) {
      newErrors.requestId = "Select an exchange";
    }

    if (!formData.topicKey) {
      newErrors.topicKey = "Select the skill for this session";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    } else if (formData.date < getTodayString()) {
      newErrors.date = "Date cannot be in the past";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    } else if (
      formData.date &&
      !newErrors.date &&
      getSessionDateTime(formData.date, formData.time) <= new Date()
    ) {
      newErrors.time = "Session time must be in the future";
    }

    if (formData.notes.length > NOTES_MAX_LENGTH) {
      newErrors.notes = `Notes must be ${NOTES_MAX_LENGTH} characters or less`;
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const topic = topicOptions.find((item) => item.key === formData.topicKey);

      onSubmit({
        requestId: selectedExchange.id,
        skillId: topic.skillId,
        skill: topic.skill,
        teacherId: topic.teacherId,
        learnerId: topic.learnerId,
        date: formData.date,
        time: formData.time,
        durationMinutes: Number(formData.durationMinutes),
        notes: formData.notes.trim(),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-session-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title" id="schedule-session-title">
              Schedule a session
            </h3>
            <p className="modal-subtitle">Plan a learning session with your partner</p>
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

        {acceptedExchanges.length === 0 && (
          <p className="modal-note">
            You need an accepted exchange request before scheduling a session.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="requestId">Exchange</label>
            <select
              id="requestId"
              name="requestId"
              value={formData.requestId}
              onChange={handleChange}
              className={errors.requestId ? "input-error" : ""}
            >
              <option value="">Select an exchange</option>
              {acceptedExchanges.map((request) => {
                const partnerId =
                  request.sender.id === currentUser.id
                    ? request.receiver.id
                    : request.sender.id;

                return (
                  <option key={request.id} value={request.id}>
                    {getUserName(users, partnerId)} ({request.offeredSkill.title} ↔{" "}
                    {request.requestedSkill.title})
                  </option>
                );
              })}
            </select>
            {errors.requestId && <p className="error-text">{errors.requestId}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="topicKey">Skill for this session</label>
            <select
              id="topicKey"
              name="topicKey"
              value={formData.topicKey}
              onChange={handleChange}
              disabled={!selectedExchange}
              className={errors.topicKey ? "input-error" : ""}
            >
              <option value="">Select a skill</option>
              {topicOptions.map((topic) => (
                <option key={topic.key} value={topic.key}>
                  {topic.skill} (taught by{" "}
                  {topic.teacherId === currentUser.id
                    ? "you"
                    : getUserName(users, topic.teacherId)}
                  )
                </option>
              ))}
            </select>
            {errors.topicKey && <p className="error-text">{errors.topicKey}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              min={getTodayString()}
              value={formData.date}
              onChange={handleChange}
              className={errors.date ? "input-error" : ""}
            />
            {errors.date && <p className="error-text">{errors.date}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="time">Time</label>
            <input
              type="time"
              id="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className={errors.time ? "input-error" : ""}
            />
            {errors.time && <p className="error-text">{errors.time}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="durationMinutes">Duration</label>
            <select
              id="durationMinutes"
              name="durationMinutes"
              value={formData.durationMinutes}
              onChange={handleChange}
            >
              {DURATION_OPTIONS.map((minutes) => (
                <option key={minutes} value={minutes}>
                  {minutes} minutes
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes (optional)</label>
            <textarea
              id="notes"
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="What would you like to cover in this session?"
              className={errors.notes ? "input-error" : ""}
            />
            <p className="char-count">
              {formData.notes.length}/{NOTES_MAX_LENGTH}
            </p>
            {errors.notes && <p className="error-text">{errors.notes}</p>}
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="modal-cancel-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="modal-submit-button"
              disabled={acceptedExchanges.length === 0}
            >
              Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ScheduleSessionModal;