import { useState } from "react";
import "./StarRating.css";

const STARS = [1, 2, 3, 4, 5];

function StarRating({ value, onChange, label }) {
  const [hoverValue, setHoverValue] = useState(0);
  const isInteractive = typeof onChange === "function";

  if (!isInteractive) {
    return (
      <span
        className="star-rating"
        role="img"
        aria-label={`${value} out of 5 stars`}
      >
        {STARS.map((star) => (
          <span key={star} className={`star ${star <= value ? "filled" : ""}`}>
            ★
          </span>
        ))}
      </span>
    );
  }

  const displayValue = hoverValue || value;

  return (
    <div
      className="star-rating interactive"
      role="group"
      aria-label={label}
      onMouseLeave={() => setHoverValue(0)}
    >
      {STARS.map((star) => (
        <button
          key={star}
          type="button"
          className={`star star-button ${star <= displayValue ? "filled" : ""}`}
          aria-label={`${star} out of 5 stars`}
          aria-pressed={star === value}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHoverValue(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarRating;