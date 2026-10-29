import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("skillswapUser") || "null")
  );
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () =>
      setUser(JSON.parse(localStorage.getItem("skillswapUser") || "null"));
    window.addEventListener("skillswap-auth-change", updateUser);
    return () => window.removeEventListener("skillswap-auth-change", updateUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("skillswapUser");
    localStorage.removeItem("skillswapAccessToken");
    setUser(null);
    window.dispatchEvent(new Event("skillswap-auth-change"));
    navigate("/");
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-logo">
        <svg
          className="navbar-logo-mark"
          viewBox="0 0 36 36"
          aria-hidden="true"
          focusable="false"
        >
          <rect width="36" height="36" rx="11" fill="currentColor" />
          <path
            d="M9 13h17l-3-3m3 3-3 3M27 23H10l3 3m-3-3 3-3"
            fill="none"
            stroke="white"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.4"
          />
        </svg>
        <span>SkillSwap</span>
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/users">Browse</NavLink>
        <NavLink to="/requests">Requests</NavLink>
        <NavLink to="/sessions">Sessions</NavLink>
        {user ? (
          <>
            <NavLink to="/profile">{user.name}</NavLink>
            <button type="button" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Login</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;