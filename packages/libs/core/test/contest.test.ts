import fs from "node:fs";
import { resolve } from "node:path";
import { createContest } from "@xcpcio/core";

import { describe, expect, it } from "vitest";

describe("contest", () => {
  it("2023_ccpc_final", () => {
    const data = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/config.json"));
    const contestJSON = JSON.parse(data.toString());
    const contest = createContest(contestJSON);

    expect(contest.name).toMatchInlineSnapshot("\"第八届中国大学生程序设计竞赛总决赛（正式赛）\"");
    expect(contest.startTime).toMatchInlineSnapshot("\"2023-05-14T01:10:00.000Z\"");
    expect(contest.endTime).toMatchInlineSnapshot("\"2023-05-14T06:10:00.000Z\"");
    expect(contest.freezeTime).toMatchInlineSnapshot("\"2023-05-14T05:10:00.000Z\"");
    expect(contest.penalty).toMatchInlineSnapshot("1200");
    expect(contest.organization).toMatchInlineSnapshot("\"School\"");
    expect(contest.problems).toMatchInlineSnapshot(`
      [
        Problem {
          "balloonColor": {
            "background_color": "rgba(189, 14, 14, 0.7)",
            "color": "#fff",
          },
          "id": "0",
          "label": "A",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "#951FD9",
            "color": "#fff",
          },
          "id": "1",
          "label": "B",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(255, 255, 255, 0.7)",
            "color": "#000",
          },
          "id": "2",
          "label": "C",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(38, 185, 60, 0.7)",
            "color": "#fff",
          },
          "id": "3",
          "label": "D",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(239, 217, 9, 0.7)",
            "color": "#000",
          },
          "id": "4",
          "label": "E",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(243, 88, 20, 0.7)",
            "color": "#fff",
          },
          "id": "5",
          "label": "F",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(12, 76, 138, 0.7)",
            "color": "#fff",
          },
          "id": "6",
          "label": "G",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(156, 155, 155, 0.7)",
            "color": "#000",
          },
          "id": "7",
          "label": "H",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(4, 154, 115, 0.7)",
            "color": "#fff",
          },
          "id": "8",
          "label": "I",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(159, 19, 236, 0.7)",
            "color": "#fff",
          },
          "id": "9",
          "label": "J",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(42, 197, 202, 0.7)",
            "color": "#000",
          },
          "id": "10",
          "label": "K",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(142, 56, 54, 0.7)",
            "color": "#fff",
          },
          "id": "11",
          "label": "L",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
        Problem {
          "balloonColor": {
            "background_color": "rgba(0, 0, 0, 0.7)",
            "color": "#fff",
          },
          "id": "12",
          "label": "M",
          "name": "",
          "statistics": ProblemStatistics {
            "acceptedNum": 0,
            "attemptedNum": 0,
            "firstSolveSubmissions": [],
            "ignoreNum": 0,
            "lastSolveSubmissions": [],
            "pendingNum": 0,
            "rejectedNum": 0,
            "se": 0,
            "submittedNum": 0,
          },
        },
      ]
    `);

    expect(contest.statusTimeDisplay).toMatchInlineSnapshot(`
      {
        "correct": true,
        "incorrect": true,
        "pending": true,
      }
    `);
    expect(contest.medal).toMatchInlineSnapshot(`
      {
        "official": {
          "bronze": 4,
          "gold": 4,
          "silver": 4,
        },
      }
    `);

    expect(contest.getContestDuration()).toMatchInlineSnapshot("\"05:00:00\"");
    expect(contest.getContestElapsedTime()).toMatchInlineSnapshot("\"05:00:00\"");
    expect(contest.getContestRemainingTime()).toMatchInlineSnapshot("\"00:00:00\"");
    expect(contest.getContestPendingTime()).toMatchInlineSnapshot("\"00:00:00\"");
    expect(contest.getContestState()).toMatchInlineSnapshot("\"FINISHED\"");
    expect(contest.getContestProgressRatio()).toMatchInlineSnapshot("100");

    expect(JSON.stringify(contest)).toMatchSnapshot();
  });
});
