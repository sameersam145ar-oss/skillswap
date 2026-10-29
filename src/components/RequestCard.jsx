import { REQUEST_STATUS } from "../data/dummyRequests";
import "./SkillManager.css";
import "./RequestCard.css";

const STATUS_LABELS = {
  PENDING: "Pending",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function RequestCard({
  request,
  otherUserName,
  mode,
  onAccept,
  onReject,
  onCancel,
}) {
  const isPending = request.status === REQUEST_STATUS.PENDING;
  const isReceived = mode === "received";
  const who = isReceived ? "They" : "You";
  const title = isReceived
    ? `${otherUserName} sent you a request`
    : `You sent a request to ${otherUserName}`;

  return (
    <div className="request-card">
      <div className="request-header">
        <div>
          <p className="request-title">{title}</p>
          <p className="request-date">{formatDate(request.createdAt)}</p>
        </div>
        <span
          className={`status-badge status-${request.status.toLowerCase()}`}
        >
          {STATUS_LABELS[request.status]}
        </span>
      </div>

      <div className="request-skills">
        <div>
          <p className="request-skill-label">{who} offer</p>
          <div className="skill-chips">
            <span className="skill-chip teach">{request.offeredSkill}</span>
          </div>
        </div>
        <div>
          <p className="request-skill-label">{who} want to learn</p>
          <div className="skill-chips">
            <span className="skill-chip learn">{request.requestedSkill}</span>
          </div>
        </div>
      </div>

      {request.message && <p className="request-message">{request.message}</p>}

      {isPending && isReceived && (
        <div className="request-actions">
          <button
            type="button"
            className="request-button btn-accept"
            onClick={() => onAccept(request.id)}
          >
            Accept
          </button>
          <button
            type="button"
            className="request-button btn-reject"
            onClick={() => onReject(request.id)}
          >
            Reject
          </button>
        </div>
      )}

      {isPending && !isReceived && (
        <div className="request-actions">
          <button
            type="button"
            className="request-button btn-cancel"
            onClick={() => onCancel(request.id)}
          >
            Cancel request
          </button>
        </div>
      )}
    </div>
  );
}

export default RequestCard;