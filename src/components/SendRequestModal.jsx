import { useState, useEffect } from "react";
import "../pages/Auth.css";
import "./SendRequestModal.css";

const MESSAGE_MAX_LENGTH = 300;

function SendRequestModal({ user, currentUser, onClose, onSubmit }) {
  const mySkills = currentUser?.teachSkills || [];

  const [formData, setFormData] = useState({
    offeredSkill: "",
    requestedSkill: "",
    message: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.offeredSkill) {
      newErrors.offeredSkill = "Select a skill you can offer";
    }

    if (!formData.requestedSkill) {
      newErrors.requestedSkill = "Select a skill you want to learn";
    }

    if (formData.message.length > MESSAGE_MAX_LENGTH) {
      newErrors.message = `Message must be ${MESSAGE_MAX_LENGTH} characters or less`;
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      onSubmit({
        toUserId: user.id,
        offeredSkillId: Number(formData.offeredSkill),
        requestedSkillId: Number(formData.requestedSkill),
        message: formData.message.trim(),
      });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="send-request-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h3 className="modal-title" id="send-request-title">
              Send request to {user.fullName}
            </h3>
            <p className="modal-subtitle">Propose a skill exchange</p>
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

        {mySkills.length === 0 && (
          <p className="modal-note">
            Add at least one skill you can teach to your profile before sending
            a request.
          </p>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="offeredSkill">Skill you will teach</label>
            <select
              id="offeredSkill"
              name="offeredSkill"
              value={formData.offeredSkill}
              onChange={handleChange}
              className={errors.offeredSkill ? "input-error" : ""}
            >
              <option value="">Select a skill</option>
              {mySkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.title}
                </option>
              ))}
            </select>
            {errors.offeredSkill && (
              <p className="error-text">{errors.offeredSkill}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="requestedSkill">
              Skill you want to learn from {user.fullName}
            </label>
            <select
              id="requestedSkill"
              name="requestedSkill"
              value={formData.requestedSkill}
              onChange={handleChange}
              className={errors.requestedSkill ? "input-error" : ""}
            >
              <option value="">Select a skill</option>
              {user.teachSkills.map((skill) => (
                <option key={skill.id} value={skill.id}>
                  {skill.title}
                </option>
              ))}
            </select>
            {errors.requestedSkill && (
              <p className="error-text">{errors.requestedSkill}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="message">Message (optional)</label>
            <textarea
              id="message"
              name="message"
              rows="4"
              value={formData.message}
              onChange={handleChange}
              placeholder="Introduce yourself and explain what you would like to learn"
              className={errors.message ? "input-error" : ""}
            />
            <p className="char-count">
              {formData.message.length}/{MESSAGE_MAX_LENGTH}
            </p>
            {errors.message && <p className="error-text">{errors.message}</p>}
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
              disabled={mySkills.length === 0}
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SendRequestModal;