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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Tabs,
  Tab,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import { toast } from "react-toastify";

// Custom SVG Icon for the Accordion
const ExpandMoreIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10" stroke="#30364F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Component to handle Tab switching
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tournament-tabpanel-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

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

  const [openFormatModal, setOpenFormatModal] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("ROUND_ROBIN");
  const [tabValue, setTabValue] = useState(0);

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

  const handleStartClick = () => {
    const pCount = participants.length;
    const isPowerOfTwo = pCount > 2 && (pCount & (pCount - 1)) === 0;

    if (isPowerOfTwo) {
      setOpenFormatModal(true);
    } else {
      executeStart("ROUND_ROBIN");
    }
  };

  const executeStart = async (formatToUse) => {
    if (actionLoading) return;
    setOpenFormatModal(false);
    try {
      setActionLoading(true);
      const res = await startTournament(id, formatToUse);
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

  // Calculates which round is currently active so we can lock future rounds
  const getActiveRound = () => {
    const pendingRounds = Object.entries(bracket)
      .filter(([, matches]) => matches.some((m) => m.winnerId === null))
      .map(([round]) => Number(round));
    return pendingRounds.length > 0 ? Math.min(...pendingRounds) : null;
  };

  const activeRound = getActiveRound();

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
      <Container maxWidth="md">

        {/* FORMAT SELECTION MODAL */}
        <Dialog open={openFormatModal} onClose={() => setOpenFormatModal(false)}>
          <DialogTitle>Choose Tournament Format</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ mb: 2 }}>
              You have exactly {participants.length} players. You can run a standard League or a Knockout Bracket!
            </Typography>
            <FormControl>
              <RadioGroup
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value)}
              >
                <FormControlLabel value="ROUND_ROBIN" control={<Radio />} label="Round Robin (League Stage)" />
                <FormControlLabel value="KNOCKOUT" control={<Radio />} label="Single Elimination (Knockout)" />
              </RadioGroup>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenFormatModal(false)}>Cancel</Button>
            <Button variant="contained" onClick={() => executeStart(selectedFormat)} sx={{ backgroundColor: "#30364F" }}>
              Confirm & Start
            </Button>
          </DialogActions>
        </Dialog>


        {/* MAIN TOURNAMENT CARD */}
        <Paper elevation={3} sx={{ borderRadius: "12px", overflow: "hidden" }}>
          
          {/* HEADER BANNER */}
          <Box sx={{ backgroundColor: "#30364F", p: 4, color: "white", textAlign: "center" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              {tournament?.name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#E1D9BC", mb: 3 }}>
              Status: {tournament?.status}
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
              {role === "PLAYER" && (
                <Button
                  variant="contained"
                  sx={{ backgroundColor: "#E1D9BC", color: "#30364F", "&:hover": { backgroundColor: "#c5be9e" } }}
                  onClick={handleRegister}
                  disabled={actionLoading}
                >
                  {actionLoading ? "Processing..." : "Register as Player"}
                </Button>
              )}

              {role === "ADMIN" && (
                <Button
                  variant="contained"
                  sx={{ 
                    backgroundColor: "#E1D9BC", 
                    color: "#30364F", 
                    fontWeight: "bold",
                    "&:hover": { backgroundColor: "#c5be9e" },
                    "&.Mui-disabled": {
                      backgroundColor: "rgba(255, 255, 255, 0.15)",
                      color: "#ffffff"
                    }
                  }}
                  onClick={handleStartClick}
                  disabled={actionLoading || tournament.status !== "UPCOMING"}
                >
                  {tournament.status === "UPCOMING"
                    ? actionLoading ? "Starting..." : "Start Tournament"
                    : tournament.status === "ONGOING"
                    ? "Tournament Live"
                    : "Tournament Completed"}
                </Button>
              )}
            </Box>
          </Box>

          {/* NAVIGATION TABS */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", backgroundColor: "#f8f9fa" }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)} 
              centered
              TabIndicatorProps={{ style: { backgroundColor: "#30364F", height: "3px" } }}
            >
              <Tab label="Match Bracket" sx={styles.tab} />
              <Tab label="Leaderboard" sx={styles.tab} />
              <Tab label="Participants" sx={styles.tab} />
            </Tabs>
          </Box>

          {/* TAB 1: BRACKET */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ p: { xs: 2, md: 4 } }}>
              {Object.keys(bracket).length === 0 ? (
                <Typography align="center" color="text.secondary" sx={{ py: 5 }}>
                  Matches will appear here once the tournament begins.
                </Typography>
              ) : (
                Object.entries(bracket).map(([round, matches]) => {
                  const roundNum = Number(round);
                  const isExpanded = roundNum === activeRound || (activeRound === null && roundNum === 1);

                  return (
                    <Accordion 
                      key={round} 
                      defaultExpanded={isExpanded}
                      sx={styles.accordion}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={styles.accordionSummary}>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#30364F" }}>
                          Round {round} {roundNum === activeRound && " 🟢 (Active)"}
                        </Typography>
                      </AccordionSummary>
                      
                      <AccordionDetails sx={{ backgroundColor: "#ffffff", p: 3 }}>
                        <Grid container spacing={3}>
                          {matches.map((m) => {
                            // 🔥 FIX: Logic to find and display the winner's actual username!
                            const winnerName = m.winnerId === m.player1?.id 
                              ? m.player1?.username 
                              : m.player2?.username;

                            return (
                              <Grid item xs={12} sm={6} key={m.id}>
                                <Card sx={styles.matchCard}>
                                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: "16px !important" }}>
                                    
                                    <Box>
                                      <Typography sx={{ fontWeight: "bold", fontSize: "1.05rem", color: "#333" }}>
                                        {m.player1?.username} <span style={{ color: "#aaa", fontWeight: "normal", margin: "0 6px" }}>vs</span> {m.player2?.username || "BYE"}
                                      </Typography>

                                      {/* Display Winner Username or Tie */}
                                      {m.winnerId !== null && (
                                        <Typography variant="body2" sx={{ mt: 0.5, fontWeight: "bold", color: m.winnerId === 0 ? "#1976d2" : "#2e7d32" }}>
                                          {m.winnerId === 0 ? "Result: TIE" : `Winner: ${winnerName}`}
                                        </Typography>
                                      )}
                                    </Box>

                                    {/* Admin Controls */}
                                    {role === "ADMIN" && tournament?.status === "ONGOING" && m.winnerId === null && (
                                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
                                        {roundNum === activeRound ? (
                                          <>
                                            {m.player1 && <Button variant="outlined" size="small" sx={styles.actionBtn} onClick={() => handleResult(m.id, m.player1.id)}>P1 Win</Button>}
                                            {m.player2 && <Button variant="outlined" size="small" sx={styles.actionBtn} onClick={() => handleResult(m.id, m.player2.id)}>P2 Win</Button>}
                                            {m.player1 && m.player2 && <Button variant="text" color="warning" size="small" sx={{ fontWeight: "bold" }} onClick={() => handleResult(m.id, 0)}>Tie</Button>}
                                          </>
                                        ) : (
                                          <Typography variant="caption" sx={{ color: "#888", fontStyle: "italic", alignSelf: "center", backgroundColor: "#f0f0f0", px: 1.5, py: 0.5, borderRadius: 1 }}>
                                            🔒 Locked (Wait for Round {activeRound})
                                          </Typography>
                                        )}
                                      </Box>
                                    )}
                                  </CardContent>
                                </Card>
                              </Grid>
                            );
                          })}
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </Box>
          </TabPanel>

          {/* TAB 2: LEADERBOARD */}
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ p: 3, maxWidth: "500px", margin: "0 auto" }}>
              {leaderboard.length === 0 ? (
                 <Typography align="center" color="text.secondary" sx={{ py: 5 }}>
                   No points awarded yet.
                 </Typography>
              ) : (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {leaderboard.map((l, index) => (
                    <Paper 
                      key={index} 
                      elevation={0}
                      sx={{ 
                        display: "flex", 
                        justifyContent: "space-between", 
                        p: 2, 
                        backgroundColor: index === 0 ? "#e3f2fd" : index % 2 === 0 ? "#f9f9f9" : "white", 
                        border: "1px solid #eee",
                        borderRadius: "8px"
                      }}
                    >
                      <Typography sx={{ fontWeight: index === 0 ? "bold" : "medium", color: index === 0 ? "#1565c0" : "#333" }}>
                        {index + 1}. {l.username}
                      </Typography>
                      <Typography sx={{ fontWeight: "bold", color: "#30364F" }}>
                        {l.points} pts
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* TAB 3: PARTICIPANTS */}
          <TabPanel value={tabValue} index={2}>
             <Box sx={{ p: 3, maxWidth: "400px", margin: "0 auto" }}>
                {participants.length === 0 ? (
                  <Typography align="center" color="text.secondary" sx={{ py: 5 }}>No participants registered yet.</Typography>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {participants.map((p, i) => (
                      <Paper key={p.id} elevation={0} sx={{ p: 1.5, backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
                        <Typography sx={{ fontWeight: "medium", color: "#333" }}>{i + 1}. {p.username}</Typography>
                      </Paper>
                    ))}
                  </Box>
                )}
             </Box>
          </TabPanel>

        </Paper>
      </Container>
    </Box>
  );
}

const styles = {
  tab: {
    fontWeight: "bold",
    color: "#555",
    "&.Mui-selected": {
      color: "#30364F",
    }
  },
  accordion: {
    mb: 2, 
    border: "1px solid #e0e0e0", 
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)", 
    borderRadius: "8px !important",
    "&:before": { display: "none" }
  },
  accordionSummary: {
    backgroundColor: "#fafafa", 
    borderRadius: "8px",
    "&.Mui-expanded": { backgroundColor: "#f0f2f5", borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }
  },
  matchCard: {
    backgroundColor: "#ffffff",
    borderLeft: "4px solid #30364F",
    boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
    border: "1px solid #eaeaea",
    height: "100%",
    transition: "0.2s",
    "&:hover": {
      boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
      borderColor: "#ccc"
    }
  },
  actionBtn: {
    borderColor: "#e0e0e0",
    color: "#30364F",
    "&:hover": {
      borderColor: "#30364F",
      backgroundColor: "#f4f4f4"
    }
  }
};

export default TournamentDetail;