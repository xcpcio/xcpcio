import type { Image } from "./basic-types";

export interface Team {
  id?: string;
  team_id?: string;

  name?: string;
  team_name?: string;

  organization?: string;
  group?: Array<string>;
  tag?: Array<string>;

  coach?: string | Array<string>;
  members?: string | Array<string>;

  official?: boolean;
  unofficial?: boolean;
  girl?: boolean;

  badge?: Image;

  location?: string;
}

export type Teams = Array<Team> | Record<string, Team>;
