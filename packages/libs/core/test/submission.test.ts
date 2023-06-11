import { describe, expect, it } from "vitest";
import { resolve } from "node:path";
import fs from "fs";

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
        "status": "CORRECT",
        "teamId": "3000202305140002",
        "timestamp": 240,
      }
    `);
    expect(submissions.length).toMatchInlineSnapshot("1900");
    expect(JSON.stringify(submissions)).toMatchSnapshot();
  });
});