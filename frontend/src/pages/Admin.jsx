import { useState, useEffect } from "react";
import {
  createTournament,
  getTournaments,
  deleteTournament,
} from "../services/tournamentService";

import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
} from "@mui/material";

import { toast } from "react-toastify";

function Admin() {
  const [data, setData] = useState({
    name: "",
    game: "",
    maxPlayers: "",
  });

  const [tournaments, setTournaments] = useState([]);

  const role = localStorage.getItem("role");

  if (role !== "ADMIN") {
    return <h2>Access Denied</h2>;
  }

  const fetchTournaments = async () => {
    try {
      const res = await getTournaments();
      setTournaments(res);
    } catch {
      toast.error("Failed to load tournaments");
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreate = async () => {
    try {
      const res = await createTournament(data);
      toast.success(res);

      // refresh list
      fetchTournaments();
    } catch {
      toast.error("Failed to create tournament");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteTournament(id);
      toast.success(res);

      // refresh list
      fetchTournaments();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>

      {/* 🔥 CREATE FORM */}
      <TextField
        label="Tournament Name"
        fullWidth
        sx={{ marginTop: 2 }}
        onChange={(e) => setData({ ...data, name: e.target.value })}
      />

      <TextField
        label="Game"
        fullWidth
        sx={{ marginTop: 2 }}
        onChange={(e) => setData({ ...data, game: e.target.value })}
      />

      <TextField
        label="Max Players"
        type="number"
        fullWidth
        sx={{ marginTop: 2 }}
        onChange={(e) =>
          setData({ ...data, maxPlayers: e.target.value })
        }
      />

      <Button
        variant="contained"
        sx={{ marginTop: 3 }}
        onClick={handleCreate}
      >
        Create Tournament
      </Button>

      {/* 🔥 TOURNAMENT LIST */}
      <Typography variant="h5" sx={{ marginTop: 5 }}>
        Manage Tournaments
      </Typography>

      {tournaments.length === 0 ? (
        <Typography>No tournaments found</Typography>
      ) : (
        tournaments.map((t) => (
          <Card key={t.id} sx={{ marginTop: 2 }}>
            <CardContent>
              <Typography variant="h6">{t.name}</Typography>
              <Typography>Game: {t.game}</Typography>
              <Typography>Status: {t.status}</Typography>

              <Button
                variant="contained"
                color="error"
                sx={{ marginTop: 2 }}
                onClick={() => handleDelete(t.id)}
              >
                Delete
              </Button>
            </CardContent>
          </Card>
        ))
      )}
    </Container>
  );
}

export default Admin;