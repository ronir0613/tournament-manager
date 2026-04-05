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
} from "@mui/material";

// 🔥 toast import
import { toast } from "react-toastify";

function TournamentDetail() {
  const { id } = useParams();
  const role = localStorage.getItem("role");

  const [participants, setParticipants] = useState([]);
  const [bracket, setBracket] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 🔥 NEW: action loading
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const bracketRes = await API.get(`/api/tournaments/${id}/bracket`);
      const leaderboardRes = await API.get(`/api/tournaments/${id}/leaderboard`);
      const participantsRes = await API.get(`/api/tournaments/${id}/participants`);

      setBracket(bracketRes.data);
      setLeaderboard(leaderboardRes.data);
      setParticipants(participantsRes.data);

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
    return <Typography align="center">Loading...</Typography>;
  }

  if (error) {
    return <Typography color="error" align="center">{error}</Typography>;
  }

  return (
    <Container sx={{ marginTop: 4 }}>
      <Typography variant="h4" align="center">
        Tournament Details
      </Typography>

      {/* ACTIONS */}
      <div style={{ marginTop: "20px", textAlign: "center" }}>
        {role === "PLAYER" && (
          <Button
            variant="contained"
            onClick={handleRegister}
            disabled={actionLoading}
          >
            {actionLoading ? "Processing..." : "Register"}
          </Button>
        )}

        {role === "ADMIN" && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleStart}
            sx={{ marginLeft: 2 }}
            disabled={actionLoading}
          >
            {actionLoading ? "Starting..." : "Start Tournament"}
          </Button>
        )}
      </div>

      {/* PARTICIPANTS */}
      <Typography variant="h5" sx={{ marginTop: 4 }}>
        Participants
      </Typography>

      {participants.length === 0 ? (
        <Typography>No participants yet</Typography>
      ) : (
        participants.map((p) => (
          <Typography key={p.id}>{p.username}</Typography>
        ))
      )}

      {/* BRACKET */}
      <Typography variant="h5" sx={{ marginTop: 4 }}>
        Bracket
      </Typography>

      {Object.entries(bracket).map(([round, matches]) => (
        <div key={round}>
          <Typography variant="h6">Round {round}</Typography>

          {matches.map((m) => (
            <Card key={m.id} sx={{ marginTop: 2 }}>
              <CardContent>
                <Typography>
                  {m.player1?.username} vs{" "}
                  {m.player2?.username || "BYE"}
                </Typography>

                {role === "ADMIN" && (
                  <>
                    {m.player1 && (
                      <Button
                        size="small"
                        disabled={actionLoading}
                        onClick={() =>
                          handleResult(m.id, m.player1.id)
                        }
                      >
                        {m.player1.username} wins
                      </Button>
                    )}

                    {m.player2 && (
                      <Button
                        size="small"
                        sx={{ marginLeft: 1 }}
                        disabled={actionLoading}
                        onClick={() =>
                          handleResult(m.id, m.player2.id)
                        }
                      >
                        {m.player2.username} wins
                      </Button>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ))}

      {/* LEADERBOARD */}
      <Typography variant="h5" sx={{ marginTop: 4 }}>
        Leaderboard
      </Typography>

      {leaderboard.map((l, index) => (
        <Card key={index} sx={{ marginTop: 2 }}>
          <CardContent>
            <Typography>
              {l.username} - {l.wins} wins
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
}

export default TournamentDetail;