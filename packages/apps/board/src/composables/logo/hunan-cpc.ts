import type { Image } from "@xcpcio/types";
import hunan_cpc_logo from "@board/assets/hunan_cpc.png";

export function GET_LOGO_HUNAN_CPC(): Image {
  const image: Image = {};
  image.url = hunan_cpc_logo;

  return image;
}
