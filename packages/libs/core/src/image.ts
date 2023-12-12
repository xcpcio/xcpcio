import type { Image } from "@xcpcio/types";

export function getImageSource(image: Image, asset_host?: string): string {
  if (image?.url) {
    if (!asset_host) {
      return image.url;
    }

    if (image.url.startsWith("http")) {
      return image.url;
    }

    return `${asset_host}/${image.url}`;
  }

  if (image?.base64) {
    return `data:image/${image.type ?? "png"};base64,${image.base64}`;
  }

  return "";
}
