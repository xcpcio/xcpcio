export interface Team {
  name: string;
  coach?: string | string[];
  members?: string[];
  organization?: string;
  official?: boolean;
  unofficial?: boolean;
  girl?: boolean;
  [key: string]: any;
}
