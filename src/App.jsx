import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import BrowseUsers from "./pages/BrowseUsers";
import Requests from "./pages/Requests";
import Sessions from "./pages/Sessions";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/users" element={<BrowseUsers />} />
        <Route path="/requests" element={<Requests />} />
        <Route path="/sessions" element={<Sessions />} />
        <Route path="*" element={<h2>404 - Page not found</h2>} />
      </Routes>
    </>
  );
}

export default App;