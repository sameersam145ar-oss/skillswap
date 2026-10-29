import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import "./Auth.css";

const initialFormData = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
};

function Register() {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setSuccessMessage("");
  };

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = "Full name must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await api.post("/users", {
          name: formData.fullName.trim(),
          email: formData.email.trim(),
          password: formData.password,
        });
        setSuccessMessage("Account created. Redirecting to login...");
        setFormData(initialFormData);
        window.setTimeout(() => navigate("/login"), 900);
      } catch (error) {
        setErrors({ submit: String(getApiErrorMessage(error)) });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Create your account</h2>
        <p className="auth-subtitle">Join SkillSwap and start exchanging skills</p>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.submit && <p className="error-text">{errors.submit}</p>}

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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <p className="error-text">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? "input-error" : ""}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword}</p>
            )}
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Creating account..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;