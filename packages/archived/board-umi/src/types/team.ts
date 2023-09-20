export interface Person {
  name?: string;
  codeforcesHandle?: string;
}

export interface Team {
  id: string;
  name: string;
  coach?: Person | Person[];
  members?: Person | Person[];
  organization?: string;
  group?: string[];
  tag?: string[];

  official?: boolean;
  unofficial?: boolean;
  girl?: boolean;

  [key: string]: any;
}
