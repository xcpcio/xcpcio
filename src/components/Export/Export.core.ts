import { Run, SubmissionStatus } from "@/types/submission";

import {
  isAccepted,
  isPending,
  isNotCalculatedPenaltyStatus,
} from "@/core/submission";

import { getDisplayTime, deepCopy } from "@/utils";
import { JsonRankTeam } from "./Export.type";

export function submissionStatusToCodeforcesDatFile(
  status: SubmissionStatus,
): string {
  if (isAccepted(status)) {
    return "OK";
  }

  if (status === SubmissionStatus.WrongAnswer) {
    return "WA";
  }

  if (status === SubmissionStatus.TimeLimitExceeded) {
    return "TL";
  }

  if (status === SubmissionStatus.MemoryLimitExceeded) {
    return "ML";
  }

  if (status === SubmissionStatus.OutputLimitExceeded) {
    return "IL";
  }

  if (status === SubmissionStatus.PresentationError) {
    return "PE";
  }

  if (status === SubmissionStatus.RuntimeError) {
    return "RT";
  }

  if (
    status === SubmissionStatus.CompilationError ||
    isNotCalculatedPenaltyStatus(status)
  ) {
    return "CE";
  }

  if (isPending(status)) {
    return "PD";
  }

  return "RJ";
}

export function boardToDatFile(
  contestConfig: any,
  teams: any,
  submissions: Run[],
) {
  let datFile = "";

  datFile += `@contest "${contestConfig.contest_name}"
@contlen ${getDisplayTime(contestConfig.end_time - contestConfig.start_time)}
@problems ${contestConfig.problem_id.length}
@teams ${Object.keys(teams).length}
@submissions ${submissions.length}
`;

  contestConfig.problem_id.forEach((pid: string) => {
    datFile += `@p ${pid},${pid},20,0\n`;
  });

  let { team_new_id, team_problem_submit_index } = (() => {
    let team_new_id: any = {};
    let team_problem_submit_index: any = {};
    let pos = 1;

    const initProblemSubmitIndex = () => {
      return contestConfig.problem_id.map((name: string, index: number) => {
        return 0;
      });
    };

    let team_index = 1;
    for (const tid in teams) {
      team_new_id[tid] = team_index;
      team_problem_submit_index[tid] = initProblemSubmitIndex();
      team_index++;
    }

    return { team_new_id, team_problem_submit_index };
  })();

  for (const tid in teams) {
    let name = teams[tid].name;

    if (teams[tid]?.organization) {
      name = teams[tid].organization + "-" + name;
    }

    if (teams[tid]?.members) {
      name = name + " " + `(${teams[tid].members.join(", ")})`;
    }

    datFile += `@t ${team_new_id[tid]},0,1,${name}\n`;
  }

  submissions.forEach((submission: Run) => {
    const status = submissionStatusToCodeforcesDatFile(submission.status);
    ++team_problem_submit_index[submission.teamId][submission.problemId];

    datFile += `@s ${team_new_id[submission.teamId]},${
      contestConfig.problem_id[submission.problemId]
    },${team_problem_submit_index[submission.teamId][submission.problemId]},${
      submission.timestamp
    },${status}\n`;
  });

  return datFile;
}

export function boardToJSON(contestConfig: any, team: any, run: Run[]) {
  let teamJson: JsonRankTeam[] = [];
  let _team = deepCopy(team);

  const penalty = contestConfig.penalty;

  for (let k in _team) {
    _team[k]["problem"] = contestConfig.problem_id.map(() => 0);
    _team[k]["solved"] = 0;
    _team[k]["time"] = 0;
  }

  run.forEach((run: Run) => {
    if (isAccepted(run.status)) {
      _team[run.teamId].solved += 1;
      _team[run.teamId].time +=
        run.timestamp + penalty * _team[run.teamId].problem[run.problemId];
    } else {
      _team[run.teamId].problem[run.problemId] += 1;
    }
  });

  let teamList = [];
  for (let k in _team) {
    teamList.push(_team[k]);
  }

  teamList.sort((a: any, b: any) => {
    if (a.solved > b.solved) return -1;
    if (a.solved < b.solved) return 1;
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });

  teamList.forEach((team: any, index: number) => {
    let item: JsonRankTeam = {};
    item.members = team.members || [];
    item.organization = team.organization || "";
    item.name = team.name || "";
    item.place = {};
    item.place["all"] = index + 1;
    teamJson.push(item);
  });

  let rankJson: any = {};
  rankJson["contestName"] = contestConfig["contest_name"];
  rankJson["teams"] = teamJson;

  return rankJson;
}
