import { resolve } from "node:path";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { createSubmissions } from "../src/submission";

describe("submission", () => {
  it("2023_ccpc_final", () => {
    const data = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/run.json"));
    const submissionsJSON = JSON.parse(data.toString());
    const submissions = createSubmissions(submissionsJSON);

    expect(submissions[0]).toMatchInlineSnapshot(`
      Submission {
        "id": "0",
        "isIgnore": false,
        "problemId": "4",
        "status": "ACCEPTED",
        "teamId": "3000202305140002",
        "timestamp": 240,
      }
    `);
    expect(submissions[1]).toMatchInlineSnapshot(`
      Submission {
        "id": "1",
        "isIgnore": false,
        "problemId": "4",
        "status": "ACCEPTED",
        "teamId": "3000202305140003",
        "timestamp": 300,
      }
    `);
    expect(submissions[submissions.length - 1]).toMatchInlineSnapshot(`
      Submission {
        "id": "1899",
        "isIgnore": false,
        "problemId": "0",
        "status": "REJECTED",
        "teamId": "3000202305140116",
        "timestamp": 17940,
      }
    `);
    expect(submissions.length).toMatchInlineSnapshot("1900");
    expect(JSON.stringify(submissions)).toMatchSnapshot();
  });
});
