import { MedalType } from "@xcpcio/core";
import type { Team } from "@xcpcio/core";

export function getMedalColor(team: Team): { backgroundColor: string, color: string } | undefined {
  const color = {
    backgroundColor: "#fff",
    color: "#000",
  };

  if (team.awards.includes(MedalType.GOLD)) {
    color.backgroundColor = "#fff566";
    return color;
  }

  if (team.awards.includes(MedalType.SILVER)) {
    color.backgroundColor = "#ffadd2";
    return color;
  }

  if (team.awards.includes(MedalType.BRONZE)) {
    color.backgroundColor = "#f0c0a0";
    return color;
  }

  if (team.awards.includes(MedalType.HONORABLE)) {
    color.backgroundColor = "#e6f7ff";
    return color;
  }

  return undefined;
}
