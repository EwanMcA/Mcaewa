import axios from "axios";

const fetchWrapper = async (url, params) => {
  try {
    const response = await axios.get(url, params);
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const newUser = async () => {
  return fetchWrapper("/api/plan_it/user/new");
};

export const getUser = async (userId) => {
  return fetchWrapper(`/api/plan_it/user/${userId}`);
};

export const getUserGames = async (userId) => {
  return fetchWrapper("/api/plan_it/user/games", { params: { user_id: userId } });
};

export const createGame = async (userId, playerName) => {
  return fetchWrapper("/api/plan_it/new", {
    params: { user_id: userId, player_name: playerName }
  });
};

export const fetchGame = async (userId, gameId) => {
  return fetchWrapper(`/api/plan_it/${gameId}`, { params: { user_id: userId } });
};

export const joinGame = async (userId, gameId, playerName) => {
  return fetchWrapper("/api/plan_it/join", {
    params: { user_id: userId, player_name: playerName, game_id: gameId }
  });
};

export const leaveGame = async (userId, gameId, playerName) => {
  return fetchWrapper("/api/plan_it/leave", {
    params: { user_id: userId, player_name: playerName, game_id: gameId }
  });
};

export const startGame = async (userId, gameId) => {
  return fetchWrapper("/api/plan_it/start", { params: { user_id: userId, game_id: gameId } });
};

export const endTurn = async (userId, gameId) => {
  return fetchWrapper("/api/plan_it/end_turn", { params: { user_id: userId, game_id: gameId } });
};
