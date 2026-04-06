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
    <div style={styles.container}>
      
      {/* Left Branding */}
      <div style={styles.leftPanel}>
        <h1 style={styles.brand}>Tournament Hub</h1>
        <p style={styles.tagline}>
          Create your account and start competing today.
        </p>
      </div>

      {/* Right Form */}
      <div style={styles.rightPanel}>
        <div style={styles.card}>
          <h2 style={styles.heading}>Register</h2>

          <input
            style={styles.input}
            placeholder="Username"
            onChange={(e) => setData({ ...data, username: e.target.value })}
          />

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

          <select
            style={styles.select}
            onChange={(e) => setData({ ...data, role: e.target.value })}
          >
            <option value="PLAYER">PLAYER</option>
            <option value="ADMIN">ADMIN</option>
          </select>

          <button style={styles.button} onClick={handleRegister}>
            Create Account
          </button>

          <p style={styles.link} onClick={() => navigate("/")}>
            Already have an account? Login
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

  select: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ACBAC4",
    backgroundColor: "white",
    fontSize: "14px",
    cursor: "pointer",
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

export default Register;