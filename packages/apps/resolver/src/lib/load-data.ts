import { CCPC_FINAL } from "./constant";

export interface IData {
  config: string;
  team: string;
  run: string;
}

export const LoadData = (contestName?: string) => {
  if (contestName ?? CCPC_FINAL === CCPC_FINAL) {
  }

  return {
    config: "",
    team: "",
    run: "",
  };
};
