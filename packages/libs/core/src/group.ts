import type { Lang } from "@xcpcio/types";

export class Group {
  names: Map<Lang, string>;
  defaultLang: Lang;
  isDefault: boolean;

  constructor() {
    this.names = new Map<Lang, string>();
    this.defaultLang = "zh-CN";
    this.isDefault = false;
  }
}
