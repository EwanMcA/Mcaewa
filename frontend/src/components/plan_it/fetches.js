import axios from "axios";

export const fetchGame = async () => {
  try {
    const response = await axios.get("api/plan_it/0");
    const gameState = response.data[0].fields;
    gameState.nums = gameState.num_list.split(",");
    return gameState;
  } catch(err) {
    console.log(err);
    return null;
  }
};
