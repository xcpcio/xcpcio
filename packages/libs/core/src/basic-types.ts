import type { Lang } from "@xcpcio/types";

export interface SelectOptionItem {
  value: string;
  text: string;
}

export class I18nText {
  texts: Map<Lang, string>;
  defaultLang: Lang;

  constructor() {
    this.texts = new Map<Lang, string>();
    this.defaultLang = "zh-CN";
  }

  get(lang: Lang): string | undefined {
    return this.texts.get(lang);
  }

  getOrDefault(lang: Lang): string {
    return this.texts.get(lang) || this.texts.get(this.defaultLang) || "";
  }

  set(lang: Lang, text: string): void {
    this.texts.set(lang, text);
  }

  has(lang: Lang): boolean {
    return this.texts.has(lang);
  }
}
