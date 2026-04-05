import { useState } from "react";
import { registerUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Register() {
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    role: "PLAYER",
  });

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await registerUser(data);
      alert("Registered successfully");
      navigate("/");
    } catch {
      alert("Registration failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Register</h2>

      <input
        placeholder="Username"
        onChange={(e) => setData({ ...data, username: e.target.value })}
      />

      <input
        placeholder="Email"
        onChange={(e) => setData({ ...data, email: e.target.value })}
      />

      <input
        placeholder="Password"
        type="password"
        onChange={(e) => setData({ ...data, password: e.target.value })}
      />

      <br />

      <select onChange={(e) => setData({ ...data, role: e.target.value })}>
        <option value="PLAYER">PLAYER</option>
        <option value="ADMIN">ADMIN</option>
      </select>

      <br />

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;