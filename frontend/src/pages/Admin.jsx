import { useState } from "react";
import { createTournament } from "../services/tournamentService";
import {
  Container,
  Typography,
  TextField,
  Button,
} from "@mui/material";

function Admin() {
  const [data, setData] = useState({
    name: "",
    game: "",
    maxPlayers: "",
  });

  const handleCreate = async () => {
    try {
      const res = await createTournament(data);
      alert(res);
    } catch {
      alert("Failed to create tournament");
    }
  };
  const role = localStorage.getItem("role");

if (role !== "ADMIN") {
  return <h2>Access Denied</h2>;
}

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4">Admin Dashboard</Typography>

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
    </Container>
  );
}

export default Admin;