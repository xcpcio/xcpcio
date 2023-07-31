import type { Image } from "@xcpcio/types";

export function getImageSource(image: Image): string {
  if (image?.url) {
    return image.url;
  }

  if (image?.base64) {
    return `data:image/${image.type};base64,${image.base64}`;
  }

  return "";
}
