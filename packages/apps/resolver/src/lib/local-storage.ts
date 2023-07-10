import { useLocalStorage } from "react-use";

export const LOCAL_STORAGE_KEY_BOARD_DATA = "board-data";

export function useLoadBoardData() {
  return useLocalStorage(LOCAL_STORAGE_KEY_BOARD_DATA, "");
}
