import API from "./api";

export const getTournaments = async () => {
  const res = await API.get("/api/tournaments");
  return res.data;
};

export const registerForTournament = async (id) => {
  const res = await API.post(`/api/tournaments/${id}/register`);
  return res.data;
};

// 🔥 UPDATED: Added 'format' parameter and appended it to the URL
export const startTournament = async (id, format = "ROUND_ROBIN") => {
  const res = await API.put(`/api/tournaments/${id}/start?format=${format}`);
  return res.data;
};

// NOTE: To declare a tie, the frontend will pass 0 as the winnerId
export const updateMatchResult = async (matchId, winnerId) => {
  const res = await API.put(`/api/matches/${matchId}/result?winnerId=${winnerId}`);
  return res.data;
};

export const getMyMatches = async () => {
  const res = await API.get("/api/matches/my");
  return res.data;
};

export const createTournament = async (data) => {
  const res = await API.post("/api/tournaments", data);
  return res.data;
};

export const deleteTournament = async (id) => {
  const res = await API.delete(`/api/tournaments/${id}`);
  return res.data;
};

export const updateTournamentStatus = async (id, status) => {
  const res = await API.put(`/api/tournaments/${id}/status?status=${status}`);
  return res.data;
};