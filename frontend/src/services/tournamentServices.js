import API from "./api";

export const getTournaments = async () => {
  const res = await API.get("/api/tournaments");
  return res.data;
};