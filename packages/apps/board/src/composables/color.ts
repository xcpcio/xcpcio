import { furthest } from "color-diff";
import chroma from "chroma-js";

import type { Problem } from "@xcpcio/core";

export function getWhiteOrBlackColor(background: string) {
  const [R, G, B] = chroma(background).rgb();
  const color = { R, G, B };
  const palette = [{ R: 0, G: 0, B: 0 }, { R: 255, G: 255, B: 255 }];

  const f = furthest(color, palette);

  if (f.R === 0 && f.G === 0 && f.B === 0) {
    return "#000";
  } else {
    return "#fff";
  }
}

export function getProblemBalloonColor(problem: Problem): { backgroundColor: string, color: string } {
  const backgroundColor = problem.balloonColor?.background_color as string ?? "#a0f0a0";
  const color = getWhiteOrBlackColor(backgroundColor);

  return {
    backgroundColor,
    color,
  };
}
