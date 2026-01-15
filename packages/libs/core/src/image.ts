import type { Image } from "@xcpcio/types";

import { normalizePath } from "./utils";

export function getImageSource(image: Image, data_host?: string): string {
  if (image?.url) {
    if (!data_host) {
      return image.url;
    }

    if (image.url.startsWith("http")) {
      return image.url;
    }

    if (image.url.startsWith("/")) {
      return image.url;
    }

    return `${normalizePath(data_host)}${image.url}`;
  }

  if (image?.base64) {
    if (image.mime) {
      return `data:${image.mime};base64,${image.base64}`;
    }
    return `data:image/${image.type ?? "png"};base64,${image.base64}`;
  }

  return "";
}
