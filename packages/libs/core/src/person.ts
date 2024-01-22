import type { IPerson } from "@xcpcio/types";

export class Person {
  name: string;

  constructor(name = "") {
    this.name = name;
  }

  toJSON(): IPerson {
    return {
      name: this.name,
    };
  }

  static fromJSON(iPerson: IPerson | string): Person {
    if (typeof iPerson === "string") {
      iPerson = JSON.parse(iPerson) as IPerson;
    }

    const person = new Person();
    person.name = iPerson.name;

    return person;
  }
}

export type Persons = Array<Person>;

export function createPersons(iPersons: string | Array<string>): Persons {
  if (typeof iPersons === "string") {
    for (const c of " ,、|") {
      if (iPersons.includes(c)) {
        return iPersons.split(c).map(name => new Person(name));
      }
    }

    return [new Person(iPersons)];
  }

  return iPersons.map(name => new Person(name));
}
