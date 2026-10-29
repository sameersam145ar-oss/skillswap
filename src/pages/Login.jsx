import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { getApiErrorMessage } from "../api/client";
import "./Auth.css";

const initialFormData = {
  email: "",
  password: "",
};

function Login() {
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

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
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
        const { data } = await api.post("/users/login", {
          email: formData.email.trim(),
          password: formData.password,
        });
        const user = {
          id: data.id,
          name: data.name,
          email: data.email,
          bio: data.bio || "",
          location: data.location || "",
        };
        localStorage.setItem("skillswapAccessToken", data.accessToken);
        localStorage.setItem("skillswapUser", JSON.stringify(user));
        window.dispatchEvent(new Event("skillswap-auth-change"));
        setSuccessMessage("Login successful.");
        navigate("/profile");
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
        <h2 className="auth-title">Welcome back</h2>
        <p className="auth-subtitle">Login to continue to SkillSwap</p>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {errors.submit && <p className="error-text">{errors.submit}</p>}

        <form onSubmit={handleSubmit} noValidate>
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
              placeholder="Enter your password"
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <p className="error-text">{errors.password}</p>}
          </div>

          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;