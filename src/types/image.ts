export interface Image {
  url?: string;
  base64?: string;
  type?: "png" | "svg" | "jpg" | "jpeg";
  [key: string]: string | undefined;
}
