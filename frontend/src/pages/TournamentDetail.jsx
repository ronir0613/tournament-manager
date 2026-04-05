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

function TournamentDetail() {
  const role = localStorage.getItem("role");
  const { id } = useParams();

  const [bracket, setBracket] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);

  const fetchData = async () => {
    try {
      const bracketRes = await API.get(`/api/tournaments/${id}/bracket`);
      const leaderboardRes = await API.get(`/api/tournaments/${id}/leaderboard`);

      setBracket(bracketRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load tournament details");
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleRegister = async () => {
    try {
      const res = await registerForTournament(id);
      alert(res);
    } catch {
      alert("Registration failed");
    }
  };

  const handleStart = async () => {
    try {
      const res = await startTournament(id);
      alert(res);
      fetchData();
    } catch {
      alert("Start failed");
    }
  };

  const handleResult = async (matchId, winnerId) => {
    try {
      const res = await updateMatchResult(matchId, winnerId);
      alert(res);
      fetchData();
    } catch {
      alert("Failed to update result");
    }
  };

  return (
  <Container sx={{ marginTop: 4 }}>
    <Typography variant="h4" align="center">
      Tournament Details
    </Typography>

    {/* ACTIONS */}
    <div style={{ marginTop: "20px", textAlign: "center" }}>
      {role === "PLAYER" && (
        <Button variant="contained" onClick={handleRegister}>
          Register
        </Button>
      )}

      {role === "ADMIN" && (
        <Button
          variant="contained"
          color="secondary"
          onClick={handleStart}
          sx={{ marginLeft: 2 }}
        >
          Start Tournament
        </Button>
      )}
    </div>

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