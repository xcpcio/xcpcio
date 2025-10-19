import { I18nText } from "./basic-types";

export class Group {
  name: I18nText;
  isDefault: boolean;

  constructor() {
    this.name = new I18nText();
    this.isDefault = false;
  }
}
