import { useState } from "react";
import "./SkillManager.css";

const MAX_SKILLS = 10;
const MAX_LENGTH = 30;

function SkillManager({
  label,
  skills,
  onAdd,
  onRemove,
  placeholder,
  variant,
  error,
}) {
  const [inputValue, setInputValue] = useState("");
  const [localError, setLocalError] = useState("");

  const handleAdd = () => {
    const skill = inputValue.trim();

    if (!skill) {
      setLocalError("Enter a skill name");
      return;
    }
    if (skill.length > MAX_LENGTH) {
      setLocalError(`Skill must be ${MAX_LENGTH} characters or less`);
      return;
    }
    if (skills.length >= MAX_SKILLS) {
      setLocalError(`You can add up to ${MAX_SKILLS} skills`);
      return;
    }
    const isDuplicate = skills.some(
      (existing) => existing.toLowerCase() === skill.toLowerCase()
    );
    if (isDuplicate) {
      setLocalError("This skill is already added");
      return;
    }

    onAdd(skill);
    setInputValue("");
    setLocalError("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const shownError = localError || error;

  return (
    <div className="form-group">
      <label>{label}</label>

      <div className="skill-input-row">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setLocalError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={shownError ? "input-error" : ""}
        />
        <button type="button" className="skill-add-button" onClick={handleAdd}>
          Add
        </button>
      </div>

      {shownError && <p className="error-text">{shownError}</p>}

      {skills.length === 0 ? (
        <p className="skill-empty">No skills added yet</p>
      ) : (
        <div className="skill-chips">
          {skills.map((skill) => (
            <span key={skill} className={`skill-chip ${variant}`}>
              {skill}
              <button
                type="button"
                onClick={() => onRemove(skill)}
                aria-label={`Remove ${skill}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default SkillManager;