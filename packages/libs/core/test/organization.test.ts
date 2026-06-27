import { createContest, createTeams, Rank } from "@xcpcio/core";

import { describe, expect, it } from "vitest";

describe("organization", () => {
  it("uses organization logo template for contest organizations without explicit logos", () => {
    const contest = createContest({
      contest_name: "Test Contest",
      start_time: 0,
      end_time: 1,
      penalty: 1200,
      options: {
        organization_logo_template: {
          // eslint-disable-next-line no-template-curly-in-string
          url: "https://cdn.example.com/orgs/${organization_id}.png",
          width: 64,
          height: 64,
        },
      },
      organizations: [
        {
          id: "pku",
          name: "Peking University",
        },
        {
          id: "thu",
          name: "Tsinghua University",
          logo: {
            url: "https://cdn.example.com/custom/thu.png",
          },
        },
      ],
    });

    expect(contest.organizations?.[0].logo).toMatchInlineSnapshot(`
      {
        "height": 64,
        "url": "https://cdn.example.com/orgs/pku.png",
        "width": 64,
      }
    `);
    expect(contest.organizations?.[1].logo).toMatchInlineSnapshot(`
      {
        "url": "https://cdn.example.com/custom/thu.png",
      }
    `);
  });

  it("uses organization logo template for organizations built from teams", () => {
    const contest = createContest({
      contest_name: "Test Contest",
      start_time: 0,
      end_time: 1,
      penalty: 1200,
      options: {
        enable_organization: true,
        organization_logo_template: {
          // eslint-disable-next-line no-template-curly-in-string
          url: "https://cdn.example.com/orgs/${organization_id}.svg",
        },
      },
    });
    const teams = createTeams([
      {
        id: "t1",
        name: "Team 1",
        organization_id: "pku",
      },
    ]);
    const rank = new Rank(contest, teams, []);

    expect(rank.organizations[0].logo).toMatchInlineSnapshot(`
      {
        "url": "https://cdn.example.com/orgs/pku.svg",
      }
    `);
  });
});
