import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import SkillManager from "../components/SkillManager";
import "./Auth.css";
import "./Profile.css";

const BIO_MAX_LENGTH = 300;

function Profile() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("skillswapUser") || "null")
  );
  const [formData, setFormData] = useState({
    fullName: "",
    location: "",
    bio: "",
  });
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const userId = user?.id;

  useEffect(() => {
    if (!userId) {
      navigate("/login", { replace: true });
      return;
    }

    const loadProfile = async () => {
      try {
        const [{ data: profile }, { data: skills }] = await Promise.all([
          api.get(`/users/${userId}`),
          api.get(`/skills/user/${userId}`),
        ]);
        setFormData({
          fullName: profile.name || "",
          location: profile.location || "",
          bio: profile.bio || "",
        });
        setTeachSkills(
          skills
            .filter((skill) => skill.category === "TEACH")
            .map((skill) => skill.title)
        );
        setLearnSkills(
          skills
            .filter((skill) => skill.category === "LEARN")
            .map((skill) => skill.title)
        );
      } catch (error) {
        setErrors({ submit: String(getApiErrorMessage(error)) });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setSuccessMessage("");
  };

  const handleAddTeach = (skill) => {
    setTeachSkills([...teachSkills, skill]);
    setErrors({ ...errors, teachSkills: "" });
    setSuccessMessage("");
  };

  const handleRemoveTeach = (skill) => {
    setTeachSkills(teachSkills.filter((item) => item !== skill));
    setSuccessMessage("");
  };

  const handleAddLearn = (skill) => {
    setLearnSkills([...learnSkills, skill]);
    setErrors({ ...errors, learnSkills: "" });
    setSuccessMessage("");
  };

  const handleRemoveLearn = (skill) => {
    setLearnSkills(learnSkills.filter((item) => item !== skill));
    setSuccessMessage("");
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.bio.length > BIO_MAX_LENGTH) {
      newErrors.bio = `Bio must be ${BIO_MAX_LENGTH} characters or less`;
    }

    if (teachSkills.length === 0) {
      newErrors.teachSkills = "Add at least one skill you can teach";
    }

    if (learnSkills.length === 0) {
      newErrors.learnSkills = "Add at least one skill you want to learn";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSaving(true);
      try {
        const { data } = await api.put(`/users/${user.id}/profile`, {
          name: formData.fullName.trim(),
          bio: formData.bio.trim(),
          location: formData.location.trim(),
          skills: [
            ...teachSkills.map((title) => ({ title, category: "TEACH" })),
            ...learnSkills.map((title) => ({ title, category: "LEARN" })),
          ],
        });
        setTeachSkills(
          data.skills
            .filter((skill) => skill.category === "TEACH")
            .map((skill) => skill.title)
        );
        setLearnSkills(
          data.skills
            .filter((skill) => skill.category === "LEARN")
            .map((skill) => skill.title)
        );
        const updatedSessionUser = {
          ...user,
          name: data.user.name,
          bio: data.user.bio || "",
          location: data.user.location || "",
        };
        localStorage.setItem("skillswapUser", JSON.stringify(updatedSessionUser));
        setUser(updatedSessionUser);
        window.dispatchEvent(new Event("skillswap-auth-change"));
        setSuccessMessage("Profile saved.");
      } catch (error) {
        setErrors({ submit: String(getApiErrorMessage(error)) });
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="auth-title">Your Profile</h2>
        <p className="auth-subtitle">
          Tell others what you can teach and what you want to learn
        </p>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.submit && <p className="error-text">{errors.submit}</p>}
        {isLoading ? (
          <p>Loading profile...</p>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? "input-error" : ""}
            />
            {errors.fullName && <p className="error-text">{errors.fullName}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
              className={errors.location ? "input-error" : ""}
            />
            {errors.location && <p className="error-text">{errors.location}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio (optional)</label>
            <textarea
              id="bio"
              name="bio"
              rows="4"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write a short introduction about yourself"
              className={errors.bio ? "input-error" : ""}
            />
            <p className="char-count">
              {formData.bio.length}/{BIO_MAX_LENGTH}
            </p>
            {errors.bio && <p className="error-text">{errors.bio}</p>}
          </div>

          <SkillManager
            label="Skills I can teach"
            skills={teachSkills}
            onAdd={handleAddTeach}
            onRemove={handleRemoveTeach}
            placeholder="Example: React, Guitar, Photography"
            variant="teach"
            error={errors.teachSkills}
          />

          <SkillManager
            label="Skills I want to learn"
            skills={learnSkills}
            onAdd={handleAddLearn}
            onRemove={handleRemoveLearn}
            placeholder="Example: Python, Spanish, Cooking"
            variant="learn"
            error={errors.learnSkills}
          />

          <button type="submit" className="auth-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Profile"}
          </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;