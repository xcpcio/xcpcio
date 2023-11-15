import chroma from "chroma-js";
import { furthest } from "color-diff";

export function getWhiteOrBlackColorV1(background: string) {
  const [R, G, B] = chroma(background).rgb();
  const color = { R, G, B };
  const palette = [
    { R: 0, G: 0, B: 0 },
    { R: 255, G: 255, B: 255 },
  ];

  const f = furthest(color, palette);

  if (f.R === 0 && f.G === 0 && f.B === 0) {
    return "#000";
  } else {
    return "#fff";
  }
}

export function getWhiteOrBlackColor(background: string) {
  const [R, G, B] = chroma(background).rgb();

  const brightness = (R * 299 + G * 587 + B * 114) / 1000;
  const threshold = 148;

  return brightness <= threshold ? "#fff" : "#000";
}
