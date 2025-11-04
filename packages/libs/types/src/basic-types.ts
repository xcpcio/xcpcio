/**
 * ISO8601 String.
 * @example
 * '2019-01-01T00:00:00Z'
 * '2019-01-01T08:00:00+08:00'
 * '2019-01-01T00:00:00.000Z'
 */
export type DateTimeISO8601String = string;

export type Lang = "en" | "zh-CN";

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

export type ThemeColor
  = | Color
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
  color: Color;
  background_color: Color;
}

/**
 * i18n string set.
 * @example
 * { "en": 'English', "zh-CN": '中文', fallback: 'English' }
 * { "en": 'English', "zh-CN": '中文', fallback_lang: 'en' }
 */
export interface I18NStringSet {
  /**
   * The fallback string if renderer cannot determine the language to use.
   */
  fallback?: string;
  /**
   * The fallback language to use if the requested language is not available.
   */
  fallback_lang?: Lang;
  /**
   * Language-specific text mappings.
   */
  texts?: Partial<Record<Lang, string>>;
}

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
export type UrlString = string;

export type ImagePreset = "ICPC" | "CCPC" | "HUNAN_CPC";

export interface Link {
  link: LinkString;
  title?: string;
}

export interface Image {
  url?: string;
  mime?: string;

  base64?: Base64;
  type?: "png" | "svg" | "jpg" | "jpeg";

  preset?: ImagePreset;

  width?: number;
  height?: number;
}

export interface StatusTimeDisplay {
  correct: boolean;
  incorrect: boolean;
  pending: boolean;
}

export type TimeUnit = "second" | "millisecond" | "microsecond" | "nanosecond";

export interface DataItem {
  url: UrlString;
  version?: string;
}

export interface Organization {
  id: string;
  name: Text;

  logo?: Image;
}

export type Organizations = Array<Organization>;
