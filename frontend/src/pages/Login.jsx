import { useState } from "react";
import { loginUser } from "../services/authService";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

function Login() {
  const [data, setData] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const token = await loginUser(data);
      localStorage.setItem("token", token);

      const decoded = jwtDecode(token);
      localStorage.setItem("role", decoded.role);

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={styles.container}>
      
      {/* Left Branding */}
      <div style={styles.leftPanel}>
        <h1 style={styles.brand}>Tournament Hub</h1>
        <p style={styles.tagline}>
          Manage and join tournaments effortlessly.
        </p>
      </div>

      {/* Right Form */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Login</h2>

          <input
            style={styles.input}
            placeholder="Email"
            onChange={(e) => setData({ ...data, email: e.target.value })}
          />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            onChange={(e) => setData({ ...data, password: e.target.value })}
          />

          <button style={styles.button} onClick={handleLogin}>
            Sign In
          </button>

          <p style={styles.link} onClick={() => navigate("/register")}>
            Don’t have an account? Register
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "sans-serif",
  },

  leftPanel: {
    flex: 1,
    backgroundColor: "#30364F",
    color: "#F0F0DB",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px",
  },

  brand: {
    fontSize: "36px",
    marginBottom: "10px",
  },

  tagline: {
    color: "#ACBAC4",
    fontSize: "16px",
    textAlign: "center",
    maxWidth: "300px",
  },

  rightPanel: {
    flex: 1,
    backgroundColor: "#F0F0DB",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  card: {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "10px",
    width: "320px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },

  heading: {
    textAlign: "center",
    color: "#30364F",
    marginBottom: "10px",
  },

  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ACBAC4",
    outline: "none",
    fontSize: "14px",
  },

  button: {
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#30364F",
    color: "#F0F0DB",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s",
  },

  link: {
    textAlign: "center",
    color: "#30364F",
    cursor: "pointer",
    fontSize: "14px",
  },
};

export default Login;