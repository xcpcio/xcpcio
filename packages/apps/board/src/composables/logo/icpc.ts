import type { Image } from "@xcpcio/types";
import icpc_logo from "@board/assets/icpc.png";

export function GET_LOGO_ICPC(): Image {
  const image: Image = {};
  image.url = icpc_logo;
  image.width = 2936;
  image.height = 2096;

  return image;
}
