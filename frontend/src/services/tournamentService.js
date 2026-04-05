import API from "./api";

export const getTournaments = async () => {
  const res = await API.get("/api/tournaments");
  return res.data;
};

export const registerForTournament = async (id) => {
  const res = await API.post(`/api/tournaments/${id}/register`);
  return res.data;
};

export const startTournament = async (id) => {
  const res = await API.put(`/api/tournaments/${id}/start`);
  return res.data;
};

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