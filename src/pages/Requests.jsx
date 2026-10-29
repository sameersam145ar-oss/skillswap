import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import RequestCard from "../components/RequestCard";
import { REQUEST_STATUS } from "../data/dummyRequests";
import "./Requests.css";

function mapRequest(request) {
  return {
    id: request.id,
    fromUserId: request.sender.id,
    toUserId: request.receiver.id,
    fromUserName: request.sender.name,
    toUserName: request.receiver.name,
    offeredSkill: request.offeredSkill.title,
    requestedSkill: request.requestedSkill.title,
    message: request.message || "",
    status: request.status,
    createdAt: request.createdAt,
  };
}

function Requests() {
  const [currentUser] = useState(() =>
    JSON.parse(localStorage.getItem("skillswapUser") || "null")
  );
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("received");
  const [isLoading, setIsLoading] = useState(Boolean(currentUser));
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const loadRequests = async () => {
      try {
        const [{ data: sent }, { data: received }] = await Promise.all([
          api.get(`/swap-requests/sender/${currentUser.id}`),
          api.get(`/swap-requests/receiver/${currentUser.id}`),
        ]);
        setRequests([...sent, ...received].map(mapRequest));
      } catch (error) {
        setErrorMessage(String(getApiErrorMessage(error)));
      } finally {
        setIsLoading(false);
      }
    };

    loadRequests();
  }, [currentUser]);

  const receivedRequests = requests.filter(
    (request) => request.toUserId === currentUser?.id
  );
  const sentRequests = requests.filter(
    (request) => request.fromUserId === currentUser?.id
  );
  const visibleRequests =
    activeTab === "received" ? receivedRequests : sentRequests;

  const updateStatus = async (requestId, newStatus) => {
    try {
      const { data } = await api.put(
        `/swap-requests/${requestId}/status`,
        null,
        { params: { status: newStatus } }
      );
      const updatedRequest = mapRequest(data);
      setRequests((existing) =>
        existing.map((request) =>
          request.id === requestId ? updatedRequest : request
        )
      );
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(String(getApiErrorMessage(error)));
    }
  };

  const handleReject = (requestId) => {
    if (window.confirm("Are you sure you want to reject this request?")) {
      updateStatus(requestId, REQUEST_STATUS.REJECTED);
    }
  };

  const handleCancel = (requestId) => {
    if (window.confirm("Are you sure you want to cancel this request?")) {
      updateStatus(requestId, REQUEST_STATUS.CANCELLED);
    }
  };

  if (!currentUser) {
    return (
      <div className="requests-container">
        <h2 className="requests-title">Exchange Requests</h2>
        <p className="no-requests">
          <Link to="/login">Log in</Link> to view your requests.
        </p>
      </div>
    );
  }

  return (
    <div className="requests-container">
      <h2 className="requests-title">Exchange Requests</h2>
      <p className="requests-subtitle">
        Manage the skill exchange requests you sent and received
      </p>

      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="tabs">
        <button
          type="button"
          className={`tab-button ${activeTab === "received" ? "active" : ""}`}
          onClick={() => setActiveTab("received")}
        >
          Received ({receivedRequests.length})
        </button>
        <button
          type="button"
          className={`tab-button ${activeTab === "sent" ? "active" : ""}`}
          onClick={() => setActiveTab("sent")}
        >
          Sent ({sentRequests.length})
        </button>
      </div>

      {isLoading ? (
        <p className="no-requests">Loading requests...</p>
      ) : visibleRequests.length === 0 ? (
        <p className="no-requests">
          {activeTab === "received"
            ? "You have not received any requests yet."
            : "You have not sent any requests yet."}
        </p>
      ) : (
        <div className="requests-list">
          {visibleRequests.map((request) => {
            const otherUserName =
              activeTab === "received"
                ? request.fromUserName
                : request.toUserName;

            return (
              <RequestCard
                key={request.id}
                request={request}
                otherUserName={otherUserName}
                mode={activeTab}
                onAccept={(id) => updateStatus(id, REQUEST_STATUS.ACCEPTED)}
                onReject={handleReject}
                onCancel={handleCancel}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Requests;
