export interface Team {
  team_id: string;
  name: string;

  organization?: string;
  group?: Array<string>;
  tag?: Array<string>;

  coach?: string | Array<string>;
  members?: string | Array<string>;

  official?: boolean;
  unofficial?: boolean;
  girl?: boolean;
}

export type Teams = Array<Team>;
