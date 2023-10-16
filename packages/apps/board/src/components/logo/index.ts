import type { Image } from "@xcpcio/types";

import { GET_LOGO_ICPC } from "./icpc";
import { GET_LOGO_CCPC } from "./ccpc";
import { GET_LOGO_HUNAN_CPC } from "./hunan-cpc";

export function getLogoFromPreset(image: Image): Image {
  if (!image.preset) {
    return image;
  }

  const preset = image.preset.toUpperCase();

  if (preset === "ICPC") {
    return GET_LOGO_ICPC();
  }

  if (preset === "CCPC") {
    return GET_LOGO_CCPC();
  }

  if (preset === "HUNAN_CPC") {
    return GET_LOGO_HUNAN_CPC();
  }

  return image;
}
