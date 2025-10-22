import type { Image, Text } from "./basic-types";
import type { Persons } from "./person";

export interface Team {
  id?: string;
  team_id?: string;

  name?: Text;
  team_name?: Text;

  organization?: string;
  group?: Array<string>;
  tag?: Array<string>;

  coach?: Text | Array<Text> | Persons;
  coaches?: Text | Array<Text> | Persons;
  members?: Text | Array<Text> | Persons;

  official?: boolean;
  unofficial?: boolean;
  girl?: boolean;

  badge?: Image;

  missing_photo?: boolean;
  photo?: Image;

  location?: string;
  icpc_id?: string;
}

export type Teams = Array<Team> | Record<string /* team_id */, Team>;
