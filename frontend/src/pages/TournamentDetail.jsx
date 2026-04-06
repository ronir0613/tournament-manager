import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  registerForTournament,
  startTournament,
  updateMatchResult,
} from "../services/tournamentService";
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Grid,
} from "@mui/material";

import { toast } from "react-toastify";

function TournamentDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role");

  const [participants, setParticipants] = useState([]);
  const [bracket, setBracket] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [tournament, setTournament] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const bracketRes = await API.get(`/api/tournaments/${id}/bracket`);
      const leaderboardRes = await API.get(`/api/tournaments/${id}/leaderboard`);
      const participantsRes = await API.get(`/api/tournaments/${id}/participants`);
      const tournamentRes = await API.get(`/api/tournaments/${id}`);

      setBracket(bracketRes.data);
      setLeaderboard(leaderboardRes.data);
      setParticipants(participantsRes.data);
      setTournament(tournamentRes.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tournament details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const res = await registerForTournament(id);
      toast.success(res);
      fetchData();
    } catch {
      toast.error("Registration failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const res = await startTournament(id);
      toast.success(res);
      fetchData();
    } catch {
      toast.error("Start failed");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResult = async (matchId, winnerId) => {
    if (actionLoading) return;
    try {
      setActionLoading(true);
      const res = await updateMatchResult(matchId, winnerId);
      toast.success(res);
      fetchData();
    } catch {
      toast.error("Failed to update result");
    } finally {
      setActionLoading(false);
    }
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
    <Box sx={{ backgroundColor: "#F0F0DB", minHeight: "100vh", py: 4 }}>
      <Container>

        {/* HEADER */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h4" sx={{ color: "#30364F" }}>
            {tournament?.name}
          </Typography>
        </Box>

        {/* ACTIONS */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          {role === "PLAYER" && (
            <Button
              variant="contained"
              sx={{ backgroundColor: "#30364F" }}
              onClick={handleRegister}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Register"}
            </Button>
          )}

          {role === "ADMIN" && (
            <Button
              variant="contained"
              sx={{ ml: 2, backgroundColor: "#ACBAC4", color: "#30364F" }}
              onClick={handleStart}
              disabled={actionLoading || tournament.status !== "UPCOMING"}
            >
              {tournament.status === "UPCOMING"
                ? actionLoading
                  ? "Starting..."
                  : "Start Tournament"
                : tournament.status === "ONGOING"
                ? "Tournament Live"
                : "Completed"}
            </Button>
          )}
        </Box>

        {/* GRID */}
        <Grid container spacing={3}>

          {/* PARTICIPANTS */}
          <Grid item xs={12} md={4}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6">Participants</Typography>

                {participants.length === 0 ? (
                  <Typography>No participants</Typography>
                ) : (
                  participants.map((p) => (
                    <Typography key={p.id}>{p.username}</Typography>
                  ))
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* BRACKET */}
          <Grid item xs={12} md={8}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6">Bracket</Typography>

                {Object.entries(bracket).map(([round, matches]) => (
                  <Box key={round} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1">
                      Round {round}
                    </Typography>

                    {matches.map((m) => (
                      <Card key={m.id} sx={styles.matchCard}>
                        <CardContent>
                          <Typography>
                            {m.player1?.username} vs{" "}
                            {m.player2?.username || "BYE"}
                          </Typography>

                          {role === "ADMIN" &&
                            tournament?.status === "ONGOING" && (
                              <Box sx={{ mt: 1 }}>
                                {m.player1 && (
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      handleResult(m.id, m.player1.id)
                                    }
                                  >
                                    {m.player1.username}
                                  </Button>
                                )}

                                {m.player2 && (
                                  <Button
                                    size="small"
                                    sx={{ ml: 1 }}
                                    onClick={() =>
                                      handleResult(m.id, m.player2.id)
                                    }
                                  >
                                    {m.player2.username}
                                  </Button>
                                )}
                              </Box>
                            )}
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                ))}
              </CardContent>
            </Card>
          </Grid>

          {/* LEADERBOARD */}
          <Grid item xs={12}>
            <Card sx={styles.card}>
              <CardContent>
                <Typography variant="h6">Leaderboard</Typography>

                {leaderboard.map((l, index) => (
                  <Typography key={index}>
                    {index + 1}. {l.username} - {l.wins} wins
                  </Typography>
                ))}
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}

const styles = {
  card: {
    backgroundColor: "white",
    borderRadius: "10px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
  },

  matchCard: {
    marginTop: "10px",
    backgroundColor: "#E1D9BC",
  },
};

export default TournamentDetail;