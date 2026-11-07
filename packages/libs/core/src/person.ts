import type { Person as IPerson, Persons as IPersons, Text as IText } from "@xcpcio/types";
import { I18nText } from "./basic-types";

export class Person {
  name: I18nText;

  cfID?: string;
  icpcID?: string;

  constructor(name?: I18nText) {
    this.name = name ?? new I18nText();
  }

  toIPerson(): IPerson {
    return {
      name: this.name.toI18NStringSet(),
      cf_id: this.cfID,
      icpc_id: this.icpcID,
    };
  }

  static fromIPerson(iPerson: IPerson): Person {
    const person = new Person();
    person.name = I18nText.fromIText(iPerson.name);
    person.cfID = iPerson.cf_id;
    person.icpcID = iPerson.icpc_id;
    return person;
  }
}

export type Persons = Array<Person>;

export function createPersons(iPersons?: IText | Array<IText> | IPersons): Persons {
  if (!iPersons) {
    return [];
  }

  if (typeof iPersons === "string") {
    for (const c of " ,、|") {
      if (iPersons.includes(c)) {
        return iPersons.split(c).map(name => new Person(I18nText.fromIText(name)));
      }
    }

    return [new Person(I18nText.fromIText(iPersons))];
  }

  if (Array.isArray(iPersons)) {
    // Filter out null/undefined elements first
    const validPersons = iPersons.filter(p => p != null);

    if (validPersons.length === 0) {
      return [];
    }

    if (typeof validPersons[0] === "object" && "name" in validPersons[0]) {
      return validPersons.map(iPerson => Person.fromIPerson(iPerson as IPerson));
    }

    return validPersons.map(name => new Person(I18nText.fromIText(name as IText)));
  }

  return [new Person(I18nText.fromIText(iPersons))];
}
