import "./SkillManager.css";
import "./UserCard.css";

function getInitials(fullName) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join("");
}

function UserCard({
  user,
  ratingSummary = { average: 0, count: 0 },
  isCurrentUser,
  onSendRequest,
}) {
  const { average, count } = ratingSummary;
  const reviewWord = count === 1 ? "review" : "reviews";

  return (
    <div className="user-card">
      <div className="user-card-header">
        <div className="user-avatar">{getInitials(user.fullName)}</div>
        <div>
          <p className="user-name">{user.fullName}</p>
          <p className="user-location">{user.location}</p>

          {count > 0 ? (
            <p
              className="user-rating"
              aria-label={`Average rating ${average.toFixed(1)} out of 5 from ${count} ${reviewWord}`}
            >
              <span className="user-rating-star">★</span>
              <span className="user-rating-value">{average.toFixed(1)}</span>
              <span className="user-rating-count">
                ({count} {reviewWord})
              </span>
            </p>
          ) : (
            <p className="user-rating-empty">No reviews yet</p>
          )}
        </div>
      </div>

      {user.bio && <p className="user-bio">{user.bio}</p>}

      <div className="user-skill-section">
        <h4>Can teach</h4>
        <div className="skill-chips">
          {user.teachSkills.map((skill) => (
            <span key={skill.id} className="skill-chip teach">
              {skill.title}
            </span>
          ))}
        </div>
      </div>

      <div className="user-skill-section">
        <h4>Wants to learn</h4>
        <div className="skill-chips">
          {user.learnSkills.map((skill) => (
            <span key={skill.id} className="skill-chip learn">
              {skill.title}
            </span>
          ))}
        </div>
      </div>

      {isCurrentUser ? (
        <p className="user-self-note">This is your profile</p>
      ) : (
        <button
          type="button"
          className="user-request-button"
          onClick={() => onSendRequest(user)}
        >
          Send Request
        </button>
      )}
    </div>
  );
}

export default UserCard;