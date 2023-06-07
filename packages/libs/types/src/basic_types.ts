export interface Color {
  background_color: string;
  color: string;
}

export interface Link {
  homepage?: string;
  registration?: string;
}

export interface Image {
  url?: string;
  base64?: string;
  type?: "png" | "svg" | "jpg" | "jpeg";
  [key: string]: string | undefined;
}
