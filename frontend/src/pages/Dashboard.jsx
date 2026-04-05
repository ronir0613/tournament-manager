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
} from "@mui/material";

function Dashboard() {
  const [tournaments, setTournaments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [myMatches, setMyMatches] = useState([]);

  const [gameFilter, setGameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tournamentsData = await getTournaments();
        setTournaments(tournamentsData);
        setFiltered(tournamentsData);

        const matchesData = await getMyMatches();
        setMyMatches(matchesData);

      } catch (err) {
        console.error(err);
        alert("Failed to load data");
      }
    };

    fetchData();
  }, []);

  // 🔥 FILTER LOGIC
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

  return (
    <Container>

      {/* 🔥 MY MATCHES */}
      <Typography variant="h5" sx={{ marginTop: 4 }}>
        My Matches
      </Typography>

      {myMatches.length === 0 ? (
        <Typography>No matches yet</Typography>
      ) : (
        myMatches.map((m) => (
          <Card key={m.id} sx={{ marginTop: 2 }}>
            <CardContent>
              <Typography>
                {m.player1?.username} vs {m.player2?.username || "BYE"}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      {/* 🔥 TOURNAMENT TITLE */}
      <Typography variant="h4" align="center" sx={{ marginTop: 5 }}>
        Tournaments
      </Typography>

      {/* 🔥 FILTER UI */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <TextField
          label="Filter by game"
          variant="outlined"
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
      </div>

      {/* 🔥 TOURNAMENT LIST */}
      {filtered.length === 0 ? (
        <Typography sx={{ marginTop: 2 }}>
          No tournaments match filter
        </Typography>
      ) : (
        filtered.map((t) => (
          <Card
            key={t.id}
            sx={{ marginTop: 3, cursor: "pointer" }}
            onClick={() => navigate(`/tournament/${t.id}`)}
          >
            <CardContent>
              <Typography variant="h5">{t.name}</Typography>
              <Typography>Game: {t.game}</Typography>
              <Typography>Status: {t.status}</Typography>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}

export default Dashboard;