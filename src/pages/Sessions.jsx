import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import SessionCard from "../components/SessionCard";
import ScheduleSessionModal from "../components/ScheduleSessionModal";
import ReviewModal from "../components/ReviewModal";
import { SESSION_STATUS } from "../data/dummySessions";
import { getSessionDateTime } from "../utils/dateUtils";
import "./Auth.css";
import "./Requests.css";
import "./Sessions.css";

const TABS = [
  { key: SESSION_STATUS.SCHEDULED, label: "Scheduled" },
  { key: SESSION_STATUS.COMPLETED, label: "Completed" },
  { key: SESSION_STATUS.CANCELLED, label: "Cancelled" },
  { key: "ALL", label: "All" },
];

function mapSession(session) {
  return {
    id: session.id,
    requestId: session.request.id,
    skill: session.skill.title,
    teacherId: session.teacher.id,
    teacherName: session.teacher.name,
    learnerId: session.learner.id,
    learnerName: session.learner.name,
    date: session.date,
    time: session.time.slice(0, 5),
    durationMinutes: session.durationMinutes,
    notes: session.notes || "",
    status: session.status,
  };
}

function mapReview(review) {
  return {
    id: review.id,
    sessionId: review.session.id,
    reviewerId: review.reviewer.id,
    revieweeId: review.reviewee.id,
    rating: review.rating,
    comment: review.comment || "",
    createdAt: review.createdAt.slice(0, 10),
  };
}

function Sessions() {
  const [currentUser] = useState(() =>
    JSON.parse(localStorage.getItem("skillswapUser") || "null")
  );
  const [sessions, setSessions] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [acceptedExchanges, setAcceptedExchanges] = useState([]);
  const [isLoading, setIsLoading] = useState(Boolean(currentUser));
  const [activeTab, setActiveTab] = useState(SESSION_STATUS.SCHEDULED);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!currentUser) return;

    const loadSessions = async () => {
      try {
        const [sessionResponse, reviewResponse, sentResponse, receivedResponse] =
          await Promise.all([
            api.get("/sessions", { params: { userId: currentUser.id } }),
            api.get(`/reviews/user/${currentUser.id}`),
            api.get(`/swap-requests/sender/${currentUser.id}`),
            api.get(`/swap-requests/receiver/${currentUser.id}`),
          ]);
        setSessions(sessionResponse.data.map(mapSession));
        setReviews(reviewResponse.data.map(mapReview));
        setAcceptedExchanges(
          [...sentResponse.data, ...receivedResponse.data].filter(
            (request) => request.status === "ACCEPTED"
          )
        );
      } catch (error) {
        setErrorMessage(String(getApiErrorMessage(error)));
      } finally {
        setIsLoading(false);
      }
    };

    loadSessions();
  }, [currentUser]);

  const users = [
    ...new Map(
      acceptedExchanges.flatMap((request) => [
        [request.sender.id, request.sender],
        [request.receiver.id, request.receiver],
      ])
    ).values(),
  ];

  const countFor = (tabKey) =>
    tabKey === "ALL"
      ? sessions.length
      : sessions.filter((session) => session.status === tabKey).length;

  const sortDirection = activeTab === SESSION_STATUS.SCHEDULED ? 1 : -1;
  const visibleSessions = [...sessions]
    .filter((session) => activeTab === "ALL" || session.status === activeTab)
    .sort(
      (a, b) =>
        sortDirection *
        (getSessionDateTime(a.date, a.time) - getSessionDateTime(b.date, b.time))
    );

  const updateStatus = async (sessionId, status) => {
    try {
      const { data } = await api.put(
        `/sessions/${sessionId}/status`,
        null,
        { params: { status } }
      );
      const updatedSession = mapSession(data);
      setSessions((existing) =>
        existing.map((session) =>
          session.id === sessionId ? updatedSession : session
        )
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(String(getApiErrorMessage(error)));
    }
  };

  const handleComplete = (sessionId) => {
    if (window.confirm("Mark this session as completed?")) {
      updateStatus(sessionId, SESSION_STATUS.COMPLETED);
    }
  };

  const handleCancel = (sessionId) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      updateStatus(sessionId, SESSION_STATUS.CANCELLED);
    }
  };

  const handleSchedule = async (sessionData) => {
    try {
      const { data } = await api.post("/sessions", {
        requestId: sessionData.requestId,
        skillId: sessionData.skillId,
        teacherId: sessionData.teacherId,
        learnerId: sessionData.learnerId,
        date: sessionData.date,
        time: sessionData.time,
        durationMinutes: sessionData.durationMinutes,
        notes: sessionData.notes,
      });
      setSessions((existing) => [...existing, mapSession(data)]);
      setActiveTab(SESSION_STATUS.SCHEDULED);
      setSuccessMessage("Session scheduled.");
      setErrorMessage("");
      setIsModalOpen(false);
    } catch (error) {
      setErrorMessage(String(getApiErrorMessage(error)));
    }
  };

  const handleSubmitReview = async (reviewData) => {
    const partnerId =
      reviewTarget.teacherId === currentUser.id
        ? reviewTarget.learnerId
        : reviewTarget.teacherId;
    try {
      const { data } = await api.post("/reviews", {
        sessionId: reviewTarget.id,
        rating: reviewData.rating,
        comment: reviewData.comment,
      });
      setReviews((existing) => [...existing, mapReview(data)]);
      setSuccessMessage(
        `Review submitted for ${
          reviewTarget.teacherId === partnerId
            ? reviewTarget.teacherName
            : reviewTarget.learnerName
        }.`
      );
      setErrorMessage("");
      setReviewTarget(null);
    } catch (error) {
      setErrorMessage(String(getApiErrorMessage(error)));
    }
  };

  if (!currentUser) {
    return (
      <div className="requests-container">
        <h2 className="requests-title">Learning Sessions</h2>
        <p className="no-requests">
          <Link to="/login">Log in</Link> to view your sessions.
        </p>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <div className="sessions-header">
        <div>
          <h2 className="requests-title">Learning Sessions</h2>
          <p className="requests-subtitle">
            Schedule sessions and track their progress
          </p>
        </div>
        <button
          type="button"
          className="schedule-button"
          onClick={() => {
            setSuccessMessage("");
            setIsModalOpen(true);
          }}
        >
          + Schedule Session
        </button>
      </div>

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tab-button ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} ({countFor(tab.key)})
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="no-requests">Loading sessions...</p>
      ) : visibleSessions.length === 0 ? (
        <p className="no-requests">No sessions found in this tab.</p>
      ) : (
        <div className="requests-list">
          {visibleSessions.map((session) => {
            const partnerId =
              session.teacherId === currentUser.id
                ? session.learnerId
                : session.teacherId;
            const myReview = reviews.find(
              (review) =>
                review.sessionId === session.id &&
                review.reviewerId === currentUser.id
            );
            const partnerReview = reviews.find(
              (review) =>
                review.sessionId === session.id && review.reviewerId === partnerId
            );

            return (
              <SessionCard
                key={session.id}
                session={session}
                currentUserId={currentUser.id}
                partnerName={
                  partnerId === session.teacherId
                    ? session.teacherName
                    : session.learnerName
                }
                myReview={myReview}
                partnerReview={partnerReview}
                onComplete={handleComplete}
                onCancel={handleCancel}
                onReview={setReviewTarget}
              />
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <ScheduleSessionModal
          acceptedExchanges={acceptedExchanges}
          currentUser={currentUser}
          users={users}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSchedule}
        />
      )}

      {reviewTarget && (
        <ReviewModal
          key={reviewTarget.id}
          session={reviewTarget}
          partnerName={
            reviewTarget.teacherId === currentUser.id
              ? reviewTarget.learnerName
              : reviewTarget.teacherName
          }
          onClose={() => setReviewTarget(null)}
          onSubmit={handleSubmitReview}
        />
      )}
    </div>
  );
}

export default Sessions;
