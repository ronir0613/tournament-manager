import { useEffect, useState } from "react";
import { getTournaments } from "../services/tournamentService";
import { useNavigate } from "react-router-dom";

import {
  Container,
  Typography,
  Card,
  CardContent,
} from "@mui/material";

function Dashboard() {
  const [tournaments, setTournaments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getTournaments();
        setTournaments(data);
      } catch {
        alert("Failed to load tournaments");
      }
    };

    fetchData();
  }, []);

  return (
    <Container>
      <Typography variant="h4" align="center" sx={{ marginTop: 4 }}>
        Tournaments
      </Typography>

      {tournaments.map((t) => (
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
      ))}
    </Container>
  );
}

export default Dashboard;