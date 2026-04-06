import { useEffect, useState } from "react";
import {
  getTournaments,
  getMyMatches,
} from "../services/tournamentService";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Typography,
  Card,
  CardContent,
  TextField,
  Select,
  MenuItem,
  Button,
  Box,
  AppBar,
  Toolbar,
} from "@mui/material";

import { toast } from "react-toastify";

function Dashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [myMatches, setMyMatches] = useState([]);

  const [gameFilter, setGameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const tournamentsData = await getTournaments();
        setTournaments(tournamentsData);
        setFiltered(tournamentsData);

        const matchesData = await getMyMatches();
        setMyMatches(matchesData);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const applyFilters = (game, status) => {
    let data = tournaments;

    if (game) {
      data = data.filter((t) =>
        t.game.toLowerCase().includes(game.toLowerCase())
      );
    }

    if (status) {
      data = data.filter((t) => t.status === status);
    }

    setFiltered(data);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  if (loading) {
    return <Typography align="center" sx={{ mt: 5 }}>Loading...</Typography>;
  }

  if (error) {
    return (
      <Typography color="error" align="center" sx={{ mt: 5 }}>
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#F0F0DB", minHeight: "100vh" }}>

      {/* 🔥 NAVBAR */}
      <AppBar position="static" sx={{ backgroundColor: "#30364F" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="h6">Tournament Hub</Typography>

          <Box>
            {localStorage.getItem("role") === "ADMIN" && (
              <Button
                color="inherit"
                onClick={() => navigate("/admin")}
              >
                Admin Panel
              </Button>
            )}

            <Button color="error" variant="contained" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>

        {/* 🔥 MY MATCHES */}
        <Typography variant="h5" sx={{ mb: 2, color: "#30364F" }}>
          My Matches
        </Typography>

        {myMatches.length === 0 ? (
          <Typography>No matches yet</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {myMatches.map((m) => (
              <Card key={m.id} sx={styles.matchCard}>
                <CardContent>
                  <Typography>
                    {m.player1?.username} vs{" "}
                    {m.player2?.username || "BYE"}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* 🔥 TOURNAMENTS */}
        <Typography
          variant="h4"
          sx={{ mt: 5, mb: 2, textAlign: "center", color: "#30364F" }}
        >
          Tournaments
        </Typography>

        {/* 🔥 FILTERS */}
        <Box sx={styles.filterBox}>
          <TextField
            label="Game"
            size="small"
            onChange={(e) => {
              setGameFilter(e.target.value);
              applyFilters(e.target.value, statusFilter);
            }}
          />

          <Select
            value={statusFilter}
            size="small"
            displayEmpty
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters(gameFilter, e.target.value);
            }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="UPCOMING">UPCOMING</MenuItem>
            <MenuItem value="ONGOING">ONGOING</MenuItem>
            <MenuItem value="COMPLETED">COMPLETED</MenuItem>
          </Select>
        </Box>

        {/* 🔥 TOURNAMENT LIST */}
        {filtered.length === 0 ? (
          <Typography>No tournaments match filter</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {filtered.map((t) => (
              <Card
                key={t.id}
                sx={styles.tournamentCard}
                onClick={() => navigate(`/tournament/${t.id}`)}
              >
                <CardContent>
                  <Typography variant="h6">{t.name}</Typography>
                  <Typography>Game: {t.game}</Typography>
                  <Typography>Status: {t.status}</Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

const styles = {
  filterBox: {
    display: "flex",
    gap: "15px",
    marginBottom: "20px",
  },

  matchCard: {
    minWidth: "200px",
    backgroundColor: "#E1D9BC",
  },

  tournamentCard: {
    width: "250px",
    cursor: "pointer",
    transition: "0.3s",
    backgroundColor: "white",
    "&:hover": {
      transform: "scale(1.03)",
      boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
    },
  },
};

export default Dashboard;