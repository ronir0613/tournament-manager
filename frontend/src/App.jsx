import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import TournamentDetail from "./pages/TournamentDetail";
import Admin from "./pages/Admin";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔥 PUBLIC ROUTES */}
        <Route path="/" element={!token ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/register" element={<Register />} />

        {/* 🔥 PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={token ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/tournament/:id"
          element={token ? <TournamentDetail /> : <Navigate to="/" />}
        />

        {/* 🔥 ADMIN ONLY */}
        <Route
          path="/admin"
          element={
            token && role === "ADMIN" ? <Admin /> : <Navigate to="/dashboard" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;