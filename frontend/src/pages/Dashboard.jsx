import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTournaments } from "../services/tournamentService";

function Dashboard() {
  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load tournaments");
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Tournaments</h2>

      {tournaments.length === 0 ? (
        <p>No tournaments available</p>
      ) : (
        tournaments.map((t) => (
          <div
  key={t.id}
  onClick={() => navigate(`/tournament/${t.id}`)}
  style={{
    border: "1px solid #ccc",
    padding: "15px",
    margin: "10px 0",
    borderRadius: "8px",
    cursor: "pointer",
  }}
>
            <h3>{t.name}</h3>
            <p><strong>Game:</strong> {t.game}</p>
            <p><strong>Status:</strong> {t.status}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Dashboard;