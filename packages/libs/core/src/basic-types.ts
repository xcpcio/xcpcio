import type { I18NStringSet, Text as IText, Lang } from "@xcpcio/types";

export interface SelectOptionItem {
  value: string;
  text: string;
}

export class I18nText {
  texts: Map<Lang, string>;
  fallback?: string;
  fallbackLang?: Lang;

  constructor() {
    this.texts = new Map<Lang, string>();
  }

  get(lang: Lang): string | undefined {
    return this.texts.get(lang);
  }

  getOrDefault(lang?: Lang): string {
    return (lang ? this.texts.get(lang) : undefined) || (this.fallbackLang ? this.texts.get(this.fallbackLang) : undefined) || this.fallback || "";
  }

  set(lang: Lang, text: string): void {
    this.texts.set(lang, text);
  }

  has(lang: Lang): boolean {
    return this.texts.has(lang);
  }

  static fromI18NStringSet(stringSet: I18NStringSet): I18nText {
    const i18nText = new I18nText();
    i18nText.fallback = stringSet.fallback;
    i18nText.fallbackLang = stringSet.fallback_lang;
    if (stringSet.texts) {
      for (const [lang, text] of Object.entries(stringSet.texts)) {
        i18nText.set(lang as Lang, text);
      }
    }
    return i18nText;
  }

  static fromIText(text: IText): I18nText {
    if (typeof text === "string") {
      const i18nText = new I18nText();
      i18nText.fallback = text;
      return i18nText;
    }
    return I18nText.fromI18NStringSet(text);
  }
}
