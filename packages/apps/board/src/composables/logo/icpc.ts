import type { Image } from "@xcpcio/types";

export function GET_LOGO_ICPC(): Image {
  const image: Image = {};
  image.url = "/logos/icpc.png";
  image.width = 2936;
  image.height = 2096;

  return image;
}
