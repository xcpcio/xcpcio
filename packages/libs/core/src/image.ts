import type { Image } from "@xcpcio/types";

export function getImageSource(image: Image, asset_host?: string): string {
  if (image?.url) {
    if (!asset_host) {
      return image.url;
    }

    if (image.url.startsWith("http")) {
      return image.url;
    }

    return new URL(image.url, asset_host === "/" ? window.location.host : asset_host).toString();
  }

  if (image?.base64) {
    return `data:image/${image.type ?? "png"};base64,${image.base64}`;
  }

  return "";
}
