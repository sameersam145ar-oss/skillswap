import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import UserCard from "../components/UserCard";
import SendRequestModal from "../components/SendRequestModal";
import "./Auth.css";
import "./BrowseUsers.css";

function BrowseUsers() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(() =>
    JSON.parse(localStorage.getItem("skillswapUser") || "null")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [requestTarget, setRequestTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [{ data: people }, { data: skills }, { data: ratings }] = await Promise.all([
          api.get("/users"),
          api.get("/skills"),
          api.get("/reviews/summary"),
        ]);
        const skillsByUser = new Map();
        skills.forEach((skill) => {
          const list = skillsByUser.get(skill.user.id) || [];
          list.push(skill);
          skillsByUser.set(skill.user.id, list);
        });
        setUsers(
          people.map((person) => {
            const personSkills = skillsByUser.get(person.id) || [];
            return {
              id: person.id,
              fullName: person.name,
              location: person.location || "Location not provided",
              bio: person.bio,
              teachSkills: personSkills.filter(
                (skill) => skill.category === "TEACH"
              ),
              learnSkills: personSkills.filter(
                (skill) => skill.category === "LEARN"
              ),
              ratingSummary: ratings[person.id] || { average: 0, count: 0 },
            };
          })
        );
        const signedInUser = JSON.parse(
          localStorage.getItem("skillswapUser") || "null"
        );
        if (signedInUser) {
          const ownSkills = skillsByUser.get(signedInUser.id) || [];
          setCurrentUser({
            ...signedInUser,
            teachSkills: ownSkills.filter((skill) => skill.category === "TEACH"),
          });
        }
      } catch (error) {
        setErrorMessage(String(getApiErrorMessage(error)));
      } finally {
        setIsLoading(false);
      }
    };
    loadUsers();
  }, []);

  const allTeachSkills = useMemo(
    () =>
      [...new Set(users.flatMap((user) => user.teachSkills.map((skill) => skill.title)))].sort(),
    [users]
  );

  const keyword = searchText.trim().toLowerCase();

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      keyword === "" ||
      user.fullName.toLowerCase().includes(keyword) ||
      user.location.toLowerCase().includes(keyword) ||
      user.teachSkills.some((skill) => skill.title.toLowerCase().includes(keyword)) ||
      user.learnSkills.some((skill) => skill.title.toLowerCase().includes(keyword));

    const matchesSkill =
      selectedSkill === "" ||
      user.teachSkills.some((skill) => skill.title === selectedSkill);

    return matchesSearch && matchesSkill;
  });

  const visibleUsers =
    sortBy === "rating"
      ? [...filteredUsers].sort(
          (a, b) =>
            b.ratingSummary.average - a.ratingSummary.average ||
            b.ratingSummary.count - a.ratingSummary.count ||
            a.fullName.localeCompare(b.fullName)
        )
      : filteredUsers;

  const hasActiveFilters =
    searchText !== "" || selectedSkill !== "" || sortBy !== "default";

  const handleClear = () => {
    setSearchText("");
    setSelectedSkill("");
    setSortBy("default");
  };

  const handleOpenModal = (user) => {
    if (!currentUser) {
      setErrorMessage("Log in before sending a swap request.");
      return;
    }
    setSuccessMessage("");
    setRequestTarget(user);
  };

  const handleCloseModal = () => {
    setRequestTarget(null);
  };

  const handleSendRequest = async (requestData) => {
    try {
      await api.post("/swap-requests", {
        senderId: currentUser.id,
        receiverId: requestTarget.id,
        offeredSkillId: requestData.offeredSkillId,
        requestedSkillId: requestData.requestedSkillId,
        message: requestData.message,
      });
      setSuccessMessage(`Request sent to ${requestTarget.fullName}.`);
      setRequestTarget(null);
    } catch (error) {
      setErrorMessage(String(getApiErrorMessage(error)));
    }
  };

  return (
    <div className="browse-container">
      <h2 className="browse-title">Browse Skills</h2>
      <p className="browse-subtitle">
        Find people to learn from, and people who want to learn from you
      </p>
      {!currentUser && (
        <p className="no-results">
          <Link to="/login">Log in</Link> to send swap requests.
        </p>
      )}

      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <p className="error-text">{errorMessage}</p>}

      <div className="filter-bar">
        <input
          type="text"
          className="filter-input"
          placeholder="Search by name, location or skill"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <select
          className="filter-select"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          aria-label="Filter by teachable skill"
        >
          <option value="">All teachable skills</option>
          {allTeachSkills.map((skill) => (
            <option key={skill} value={skill}>
              {skill}
            </option>
          ))}
        </select>

        <select
          className="filter-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          aria-label="Sort users"
        >
          <option value="default">Sort: Default</option>
          <option value="rating">Sort: Highest rated</option>
        </select>

        {hasActiveFilters && (
          <button type="button" className="clear-button" onClick={handleClear}>
            Clear filters
          </button>
        )}
      </div>

      <p className="result-count">
        Showing {visibleUsers.length} of {users.length} users
      </p>

      {isLoading ? (
        <p className="no-results">Loading users...</p>
      ) : visibleUsers.length === 0 ? (
        <p className="no-results">No users found. Try a different search.</p>
      ) : (
        <div className="users-grid">
          {visibleUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              ratingSummary={user.ratingSummary}
              isCurrentUser={user.id === currentUser?.id}
              onSendRequest={handleOpenModal}
            />
          ))}
        </div>
      )}

      {requestTarget && (
        <SendRequestModal
          key={requestTarget.id}
          user={requestTarget}
          currentUser={currentUser}
          onClose={handleCloseModal}
          onSubmit={handleSendRequest}
        />
      )}
    </div>
  );
}

export default BrowseUsers;