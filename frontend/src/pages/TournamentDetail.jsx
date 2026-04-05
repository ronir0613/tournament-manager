import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API from "../services/api";
import {
  registerForTournament,
  startTournament,
  updateMatchResult,
} from "../services/tournamentService";

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
    <div style={{ padding: "20px" }}>
      <h2>Tournament Details</h2>

      {/* PLAYER ACTION */}
      {role === "PLAYER" && (
        <button onClick={handleRegister}>Register</button>
      )}

      {/* ADMIN ACTION */}
      {role === "ADMIN" && (
        <button onClick={handleStart} style={{ marginLeft: "10px" }}>
          Start Tournament
        </button>
      )}

      <h3>Bracket</h3>

      {Object.keys(bracket).length === 0 ? (
        <p>No matches yet</p>
      ) : (
        Object.entries(bracket).map(([round, matches]) => (
          <div key={round}>
            <h4>Round {round}</h4>

            {matches.map((m) => (
              <div key={m.id} style={{ marginBottom: "10px" }}>
                <p>
                  {m.player1?.username} vs {m.player2?.username || "BYE"}
                </p>

                {/* ADMIN RESULT BUTTONS */}
                {role === "ADMIN" && (
                  <>
                    {m.player1 && (
                      <button
                        onClick={() =>
                          handleResult(m.id, m.player1.id)
                        }
                      >
                        {m.player1.username} wins
                      </button>
                    )}

                    {m.player2 && (
                      <button
                        onClick={() =>
                          handleResult(m.id, m.player2.id)
                        }
                        style={{ marginLeft: "10px" }}
                      >
                        {m.player2.username} wins
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ))
      )}

      <h3>Leaderboard</h3>

      {leaderboard.length === 0 ? (
        <p>No results yet</p>
      ) : (
        leaderboard.map((l, index) => (
          <p key={index}>
            {l.username} - {l.wins} wins
          </p>
        ))
      )}
    </div>
  );
}

export default TournamentDetail;