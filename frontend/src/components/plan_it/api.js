import axios from "axios";

export const newUser = async () => {
  try {
    const response = await axios.get("/api/plan_it/user/new");
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const getUser = async (userId) => {
  try {
    const response = await axios.get(`/api/plan_it/user/${userId}`);
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const getUserGames = async (userId) => {
  try {
    const response = await axios.get("/api/plan_it/user/games", {
      params: { user_id: userId }
    });
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const fetchGame = async (userId, gameId) => {
  try {
    const response = await axios.get(`/api/plan_it/${gameId}`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const createGame = async (userId, playerName) => {
  try {
    const response = await axios.get("/api/plan_it/new", {
      params: { user_id: userId, player_name: playerName }
    });
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const joinGame = async (userId, gameId, playerName) => {
  try {
    const response = await axios.get(`/api/plan_it/join/${gameId}`, {
      params: { user_id: userId, player_name: playerName }
    });
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const leaveGame = async (userId, gameId, playerName) => {
  try {
    const response = await axios.get(`/api/plan_it/leave/${gameId}`, {
      params: { user_id: userId, player_name: playerName }
    });
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};

export const startGame = async (userId, gameId) => {
  try {
    const response = await axios.get(`/api/plan_it/start/${gameId}`, {
      params: { user_id: userId }
    });
    return response.data;
  } catch(err) {
    console.log(err);
    return null;
  }
};
