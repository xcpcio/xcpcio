export type Version = "v2";

/**
 * ISO8601 String.
 * @example
 * '2019-01-01T00:00:00Z'
 * '2019-01-01T08:00:00+08:00'
 * '2019-01-01T00:00:00.000Z'
 */
export type DateTimeISO8601String = string;

/**
 * Color HEX.
 * @example
 * '#FFFFFF'
 */
export type ColorHEX = string;

/**
 * Color RGB.
 * @example
 * 'rgb(255, 255, 255)'
 */
export type ColorRGB = string;

/**
 * Color RGBA.
 * @example
 * 'rgba(255, 255, 255, 0.75)'
 */
export type ColorRGBA = string;

/** General color format. */
export type Color = ColorHEX | ColorRGB | ColorRGBA;

export type ThemeColor =
  | Color
  | {
      light: Color;
      dark: Color;
    };

export interface Style {
  /**
   * Text color.
   * @defaultValue Determined by renderer.
   */
  text_color?: ThemeColor;

  /**
   * Background color.
   * @defaultValue Determined by renderer.
   */
  background_color?: ThemeColor;
}

export interface BalloonColor {
  background_color: ThemeColor;
  color: ThemeColor;
}

/**
 * i18n string set.
 * @example
 * { "en-US": 'English', "zh-CN": '中文', fallback: 'English' }
 */
export type I18NStringSet = {
  /** The fallback string if renderer cannot determine the language to use. */
  fallback: string;
  /** The key is the IETF BCP 47 language tag, and the value is the string for this language tag. */
  [key: string]: string;
};

/**
 * Text (i18n supported).
 */
export type Text = string | I18NStringSet;

/**
 * Contributor field. The email and url are optional.
 * @example
 * 'bLue <mail@example.com> (https://example.com/)'
 */
export type Contributor = string;

export type Base64 = string;

export type LinkString = string;

export interface Link {
  link: LinkString;
  title?: string;
}

export interface Image {
  url?: string;
  base64?: Base64;
  type?: "png" | "svg" | "jpg" | "jpeg";
  [key: string]: string | undefined;
}
