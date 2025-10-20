import type { Person as IPerson, Persons as IPersons, Text as IText } from "@xcpcio/types";
import { I18nText } from "./basic-types";

export class Person {
  name: I18nText;

  cfID?: string;
  icpcID?: string;

  constructor(name?: I18nText) {
    this.name = name ?? new I18nText();
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
    if (iPersons.length > 0 && typeof iPersons[0] === "object" && "name" in iPersons[0]) {
      return iPersons.map(iPerson => Person.fromIPerson(iPerson as IPerson));
    }

    return iPersons.map(name => new Person(I18nText.fromIText(name as IText)));
  }

  return [new Person(I18nText.fromIText(iPersons))];
}
