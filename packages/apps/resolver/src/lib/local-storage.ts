import { useLocalStorage } from "react-use";

import { IBoardData } from "./types";

export const LOCAL_STORAGE_KEY_BOARD_DATA = "board-data";

export function useLoadBoardData() {
  return useLocalStorage<IBoardData>(LOCAL_STORAGE_KEY_BOARD_DATA, {
    config: "",
    run: "",
    team: "",
  });
}
