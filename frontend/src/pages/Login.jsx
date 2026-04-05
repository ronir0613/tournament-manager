import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";

function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const token = await loginUser(data);

      localStorage.setItem("token", token);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>

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
      <button onClick={handleLogin}>Login</button>

      <p onClick={() => navigate("/register")} style={{ cursor: "pointer" }}>
        Don't have an account? Register
      </p>
    </div>
  );
}

export default Login;