export interface Team {
  name: string;
  organization?: string;
  official?: 1 | 0;
  [key: string]: any;
}
