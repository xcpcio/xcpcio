import type { Image, Organization as IOrganization, Organizations as IOrganizations } from "@xcpcio/types";

import type { Teams } from "./team";

import { I18nText } from "./basic-types";

export class Organization {
  id: string;
  name: I18nText;

  logo?: Image;
  icpcID?: string;

  // Teams belonging to this organization
  teams: Teams;

  rank: number;

  constructor() {
    this.id = "";
    this.name = new I18nText();

    this.teams = [];

    this.rank = -1;
  }

  reset() {
    this.rank = -1;
  }

  static compare(lhs: Organization, rhs: Organization): number {
    if (lhs.id < rhs.id) {
      return -1;
    } else if (lhs.id > rhs.id) {
      return 1;
    }

    return 0;
  }
}

export type Organizations = Array<Organization>;

export function createOrganizationLogoFromTemplate(template: Image | undefined, organizationId: string): Image | undefined {
  if (!template?.url) {
    return undefined;
  }

  return {
    ...template,
    url: template.url.replace(/\$\{organization_id\}/g, organizationId),
  };
}

export function createOrganization(orgJSON: IOrganization, organizationLogoTemplate?: Image): Organization {
  const org = new Organization();

  org.id = orgJSON.id;
  org.name = I18nText.fromIText(orgJSON.name);

  org.logo = orgJSON.logo ?? createOrganizationLogoFromTemplate(organizationLogoTemplate, org.id);
  org.icpcID = orgJSON.icpc_id;

  return org;
}

export function createOrganizations(orgsJSON: IOrganizations, organizationLogoTemplate?: Image): Organizations {
  return orgsJSON.map(org => createOrganization(org, organizationLogoTemplate));
}
