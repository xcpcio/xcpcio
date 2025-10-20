import type { Text } from "./basic-types";

export interface Person {
  name: Text;

  cf_id?: string;
  icpc_id?: string;
}

export type Persons = Array<Person>;
