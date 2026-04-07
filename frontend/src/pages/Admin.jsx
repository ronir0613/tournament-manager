import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  createTournament,
  getTournaments,
  deleteTournament,
  updateTournamentStatus,
} from "../services/tournamentService";

import {
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Select,
  MenuItem,
  Box,
  Grid,
} from "@mui/material";

import { toast } from "react-toastify";

function Admin() {
  const [data, setData] = useState({
    name: "",
    game: "",
    maxPlayers: "",
  });

  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();

  const role = localStorage.getItem("role");

  // 🔥 FIX: We use a .then() chain inside the useEffect. 
  // Linters recognize this as safe, asynchronous data fetching.
  useEffect(() => {
    getTournaments()
      .then((res) => setTournaments(res))
      .catch(() => toast.error("Failed to load tournaments"));
  }, []);

  // 🔥 FIX: We keep a separate function for your buttons to use when they need to refresh the data.
  const refreshTournaments = async () => {
    try {
      const res = await getTournaments();
      setTournaments(res);
    } catch {
      toast.error("Failed to load tournaments");
    }
  };

  if (role !== "ADMIN") {
    return <Typography align="center">Access Denied</Typography>;
  }

  const handleCreate = async () => {
    try {
      const res = await createTournament(data);
      toast.success(res);
      setData({ name: "", game: "", maxPlayers: "" });
      refreshTournaments(); // Calls the refresh function
    } catch {
      toast.error("Failed to create tournament");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteTournament(id);
      toast.success(res);
      refreshTournaments();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const res = await updateTournamentStatus(id, status);
      toast.success(res);
      refreshTournaments();
    } catch {
      toast.error("Status update failed");
    }
  };

  return (
    <Box sx={{ backgroundColor: "#F0F0DB", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">

        {/* HEADER */}
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: "#30364F",
            fontWeight: "bold",
          }}
        >
          Admin Control Panel
        </Typography>

        <Grid container spacing={4}>

          {/* CREATE PANEL */}
          <Grid item xs={12} md={4}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography sx={styles.sectionTitle}>
                  Create Tournament
                </Typography>

                <Box sx={styles.form}>
                  <TextField
                    label="Tournament Name"
                    size="small"
                    value={data.name}
                    onChange={(e) =>
                      setData({ ...data, name: e.target.value })
                    }
                  />

                  <TextField
                    label="Game"
                    size="small"
                    value={data.game}
                    onChange={(e) =>
                      setData({ ...data, game: e.target.value })
                    }
                  />

                  <TextField
                    label="Max Players"
                    type="number"
                    size="small"
                    value={data.maxPlayers}
                    onChange={(e) =>
                      setData({ ...data, maxPlayers: e.target.value })
                    }
                  />

                  <Button
                    variant="contained"
                    sx={styles.primaryBtn}
                    onClick={handleCreate}
                  >
                    Create
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* MANAGE PANEL */}
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tournaments.length === 0 ? (
                <Typography>No tournaments found</Typography>
              ) : (
                tournaments.map((t) => (
                  <Card key={t.id} sx={styles.tournamentRow}>
                    <CardContent sx={styles.rowContent}>

                      {/* LEFT INFO */}
                      <Box>
                        <Typography sx={styles.title}>
                          {t.name}
                        </Typography>
                        <Typography sx={styles.subtitle}>
                          {t.game}
                        </Typography>
                      </Box>

                      {/* RIGHT CONTROLS */}
                      <Box sx={styles.controls}>
                        
                        <Button
                          variant="outlined"
                          size="small"
                          sx={{ color: "#30364F", borderColor: "#30364F" }}
                          onClick={() => navigate(`/tournament/${t.id}`)}
                        >
                          View
                        </Button>

                        <Select
                          size="small"
                          value={t.status}
                          sx={styles.status}
                          onChange={(e) =>
                            handleStatusChange(t.id, e.target.value)
                          }
                        >
                          <MenuItem value="UPCOMING">UPCOMING</MenuItem>
                          <MenuItem value="ONGOING">ONGOING</MenuItem>
                          <MenuItem value="COMPLETED">COMPLETED</MenuItem>
                        </Select>

                        <Button
                          variant="contained"
                          color="error"
                          onClick={() => handleDelete(t.id)}
                        >
                          Delete
                        </Button>
                      </Box>

                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}

const styles = {
  card: {
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
    backgroundColor: "white",
    padding: "10px",
  },

  sectionTitle: {
    fontWeight: "bold",
    marginBottom: "15px",
    color: "#30364F",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  primaryBtn: {
    backgroundColor: "#30364F",
    color: "#F0F0DB",
    fontWeight: "bold",
    marginTop: "10px",
  },

  tournamentRow: {
    borderRadius: "12px",
    boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
    backgroundColor: "white",
    transition: "0.2s",
    "&:hover": {
      transform: "translateY(-2px)",
    },
  },

  rowContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontWeight: "bold",
    color: "#30364F",
  },

  subtitle: {
    color: "#777",
    fontSize: "14px",
  },

  controls: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  status: {
    backgroundColor: "#E1D9BC",
    borderRadius: "6px",
  },
};

export default Admin;