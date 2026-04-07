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
        <Typography variant="h5" sx={{ mb: 2, color: "#30364F", fontWeight: "bold" }}>
          My Matches
        </Typography>

        {myMatches.length === 0 ? (
          <Typography color="text.secondary">No matches yet</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {myMatches.map((m) => (
              <Card key={m.id} sx={styles.matchCard}>
                <CardContent>
                  <Typography variant="caption" sx={{ color: "#777", fontWeight: "bold" }}>
                    Round {m.round}
                  </Typography>
                  
                  <Typography sx={{ fontWeight: "bold", mt: 0.5, mb: 1 }}>
                    {m.player1?.username} <span style={{ color: "#888" }}>vs</span>{" "}
                    {m.player2?.username || "BYE"}
                  </Typography>

                  {/* Show the Match Status / Tie Logic */}
                  {m.winnerId === null ? (
                    <Typography variant="body2" sx={{ color: "#d97706", fontWeight: "bold" }}>
                      Status: Pending
                    </Typography>
                  ) : m.winnerId === 0 ? (
                    <Typography variant="body2" sx={{ color: "#2563eb", fontWeight: "bold" }}>
                      Result: TIE
                    </Typography>
                  ) : (
                    <Typography variant="body2" sx={{ color: "#16a34a", fontWeight: "bold" }}>
                      Completed
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* 🔥 TOURNAMENTS */}
        <Typography
          variant="h4"
          sx={{ mt: 5, mb: 2, textAlign: "center", color: "#30364F", fontWeight: "bold" }}
        >
          Tournaments
        </Typography>

        {/* 🔥 FILTERS */}
        <Box sx={styles.filterBox}>
          <TextField
            label="Game Search"
            size="small"
            sx={{ backgroundColor: "white", borderRadius: 1 }}
            onChange={(e) => {
              setGameFilter(e.target.value);
              applyFilters(e.target.value, statusFilter);
            }}
          />

          <Select
            value={statusFilter}
            size="small"
            displayEmpty
            sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              applyFilters(gameFilter, e.target.value);
            }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="UPCOMING">Upcoming</MenuItem>
            <MenuItem value="ONGOING">Ongoing</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
          </Select>
        </Box>

        {/* 🔥 TOURNAMENT LIST */}
        {filtered.length === 0 ? (
          <Typography color="text.secondary">No tournaments match your filters.</Typography>
        ) : (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
            {filtered.map((t) => (
              <Card
                key={t.id}
                sx={styles.tournamentCard}
                onClick={() => navigate(`/tournament/${t.id}`)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#30364F", mb: 1 }}>
                    {t.name}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    <strong>Game:</strong> {t.game}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Status:</strong> {t.status}
                  </Typography>
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
    justifyContent: "center",
  },

  matchCard: {
    minWidth: "220px",
    backgroundColor: "#E1D9BC",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
  },

  tournamentCard: {
    width: "250px",
    cursor: "pointer",
    transition: "0.3s",
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #e0e0e0",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
      borderColor: "#30364F",
    },
  },
};

export default Dashboard;