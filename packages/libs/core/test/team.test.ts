import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import fs from "fs";

import { createTeams } from "../src/team";

describe("team", () => {
  it("2023_ccpc_final", () => {
    const data = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/team.json"));
    const teamsJSON = JSON.parse(data.toString());
    const teams = createTeams(teamsJSON);

    expect(teams[0]).toMatchInlineSnapshot(`
      Team {
        "coach": undefined,
        "group": [],
        "id": "3000202305140115",
        "members": [
          "江骏扬",
          "罗昊",
          "辜飞云",
        ],
        "name": "前面的题目以后再来探索吧？",
        "organization": "重庆邮电大学",
        "tag": [],
      }
    `);
    expect(teams.length).toMatchInlineSnapshot('132');
    expect(JSON.stringify(teams)).toMatchSnapshot();
  });
});
