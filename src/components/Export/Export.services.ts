import { Run } from "@/interface/submission";
import {
  submissionStatusToCodeforcesDatFile,
  isAccepted,
} from "@/utils/submission";
import { getDisplayTime, deepCopy } from "@/utils";

export function toDatFile(contestConfig: any, team: any, run: Run[]) {
  let datFile = "";

  datFile += `@contest "${contestConfig.contest_name}"
@contlen ${getDisplayTime(contestConfig.end_time - contestConfig.start_time)}
@problems ${contestConfig.problem_id.length}
@teams ${Object.keys(team).length}
@submissions ${run.length}
`;

  contestConfig.problem_id.forEach((pid: string) => {
    datFile += `@p ${pid},${pid},20,0\n`;
  });

  let { team_new_id, team_problem_submit_index } = (() => {
    let team_new_id: any = {};
    let team_problem_submit_index: any = {};
    let pos = 1;
    const initP = () => {
      return contestConfig.problem_id.map((name: string, index: number) => {
        return 0;
      });
    };
    for (let tid in team) {
      team_new_id[tid] = pos;
      ++pos;
      team_problem_submit_index[tid] = initP();
    }
    return { team_new_id, team_problem_submit_index };
  })();

  for (let tid in team) {
    datFile += `@t ${team_new_id[tid]},0,1,${team[tid].name}\n`;
  }

  run.forEach((run: Run) => {
    status = submissionStatusToCodeforcesDatFile(run.status);
    ++team_problem_submit_index[run.teamId][run.problemId];
    datFile += `@s ${team_new_id[run.teamId]},${
      contestConfig.problem_id[run.problemId]
    },${team_problem_submit_index[run.teamId][run.problemId]},${
      run.timestamp
    },${status}\n`;
  });

  return datFile;
}

interface RankTeam {
  members?: string;
  organization?: string;
  name?: string;
  place?: any;
}

export function toRankJson(contestConfig: any, team: any, run: Run[]) {
  let teamJson: RankTeam[] = [];
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
    let item: RankTeam = {};
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
