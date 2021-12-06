import { getDisplayTime } from '@/utils';
import { Run } from '@/types/submission';
import { isAccepted, isWrongAnswer, isPending } from '@/core/submission';

export const timerInterval = 500;
export const INF = 0x3f3f3f3f;

export function getAnalyzeTeamId(team_id: number, Filter: number) {
  return ['analyze', 'team', team_id, Filter].join('-');
}

export function getStarId(team_id: number | string) {
  return ['star', team_id].join('-');
}

export function getStarBtnId(team_id: number | string) {
  return ['star', 'btn', team_id].join('-');
}

export function getUnStarBtnId(team_id: number | string) {
  return ['unstar', 'btn', team_id].join('-');
}

function getInitProblem(contest_config: any) {
  let problem_list: any = [];

  contest_config.problem_id.forEach((id: CharacterData, index: number) => {
    let item: any = {};

    item['problem_id'] = index;
    item['solved'] = 0;
    item['total'] = 0;
    item['attempted'] = 0;
    item['first_solve_time'] = INF;
    item['last_solve_time'] = 0;

    if (contest_config.balloon_color) {
      item['balloon_color'] = contest_config.balloon_color[index];
    }

    problem_list.push(item);
  });

  return problem_list;
}

function getInitTeam(contest_config: any, team: any) {
  let team_dic: any = {};

  for (let key in team) {
    let item = team[key];
    let new_item: any = {};

    for (let k in item) {
      new_item[k] = item[k];
    }

    new_item['solved'] = 0;
    new_item['attempted'] = 0;
    new_item['time'] = 0;
    new_item['problem'] = [];

    contest_config.problem_id.forEach((id: CharacterData, index: number) => {
      let problem: any = {};
      problem['time'] = 0;
      problem['status'] = 'unattempted';
      problem['attempt_num'] = 0;
      problem['pending_num'] = 0;
      new_item.problem.push(problem);
    });

    team_dic[key] = new_item;
  }

  return team_dic;
}

function getTeamAndProblemId(
  team_id: number | string,
  problem_id: number | string,
) {
  return [team_id, problem_id].join('-');
}

export function getProblemList(contest_config: any, run: Run[]) {
  let problem_list = getInitProblem(contest_config);

  (() => {
    let set = new Set();

    run.forEach((run: Run) => {
      if (isAccepted(run.status)) {
        set.add(getTeamAndProblemId(run.teamId, run.problemId));
      }
    });

    run.forEach((run: Run) => {
      let problem = problem_list[run.problemId];
      ++problem.total;

      if (isAccepted(run.status)) {
        ++problem.solved;

        problem.first_solve_time = Math.min(
          problem.first_solve_time,
          getDisplayTime(run.timestamp),
        );

        problem.last_solve_time = Math.max(
          problem.last_solve_time,
          getDisplayTime(run.timestamp),
        );
      }

      if (set.has(getTeamAndProblemId(run.teamId, run.problemId))) {
        problem.attempted += 1;
      }
    });
  })();

  return problem_list;
}

export function compTeamList(a: any, b: any) {
  if (a.solved !== b.solved) {
    if (a.solved > b.solved) return -1;
    if (a.solved < b.solved) return 1;
  }

  if (a.time !== b.time) {
    if (a.time < b.time) return -1;
    if (a.time > b.time) return 1;
  }

  return 0;
}

export function getTeamList(
  contest_config: any,
  team: any,
  run: Run[],
  problem_list: any,
) {
  let team_dic: any = getInitTeam(contest_config, team);
  let team_list: any = [];

  run.forEach((run: Run) => {
    let team_id = run.teamId;
    let problem_id = run.problemId;
    let team = team_dic[team_id];
    let problem = team.problem[problem_id];
    problem.attempt_num += 1;
    problem.time = run.timestamp;

    if (isAccepted(run.status)) {
      problem.status = 'correct';
      team.solved += 1;
      team.time +=
        problem.time + (problem.attempt_num - 1) * contest_config.penalty;
    } else if (isPending(run.status)) {
      problem.status = 'pending';
      problem['pending_num'] += 1;
    } else if (isWrongAnswer(run.status)) {
      problem.status = 'incorrect';
    }
  });

  run.forEach((run: Run) => {
    let team = team_dic[run.teamId];
    let problem = team.problem[run.problemId];

    if (problem.status === 'correct') {
      team.attempted += 1;
    }
  });

  for (let k in team_dic) {
    let team = team_dic[k];
    let problem = team.problem;
    team['team_id'] = k;
    for (let p_id in problem) {
      problem[p_id].time = getDisplayTime(problem[p_id].time);
    }
    team_list.push(team);
  }

  team_list.sort(compTeamList);

  for (
    let i = 0,
      unofficial = 0,
      pre_place = 0,
      pre_time = -1,
      pre_solved = contest_config.problem_id.length + 1;
    i < team_list.length;
    ++i
  ) {
    let item = team_list[i];

    // if (item.unofficial) {
    //     item.place = '*';
    //     unofficial += 1;
    //     item.place_className = contest_config.medal ? 'unofficial' : 'stnd';
    //     continue;
    // }

    if (item.solved == pre_solved && item.time == pre_time) {
      item.place = pre_place;
    } else {
      item.place = i + 1 - unofficial;
      pre_place = item.place;
      pre_time = item.time;
      pre_solved = item.solved;
    }

    if (contest_config.medal) {
      let tot = 0;
      let ok = false;
      const medal = contest_config.medal;

      [
        { gold: medal.gold },
        { silver: medal.silver },
        { bronze: medal.bronze },
        { honorable: INF },
      ].forEach((medal: any) => {
        for (let key in medal) {
          tot += medal[key];
          if (item.place <= tot && !ok) {
            item.place_className = key;
            ok = true;
          }
        }
      });
    } else {
      item.place_className = 'stnd';
    }
  }

  for (let i = 0; i < team_list.length; ++i) {
    let item = team_list[i];

    if (i == 0) {
      item.stand_className_id = 0;
    } else {
      const pre_item = team_list[i - 1];
      if (item.solved == pre_item.solved) {
        item.stand_className_id = pre_item.stand_className_id ^ 1;
      } else {
        const id = pre_item.stand_className_id;
        item.stand_className_id = (Math.floor(id / 10) ^ 1) * 10 + (id % 10);
      }
    }

    for (let j = 0; j < contest_config.problem_id.length; ++j) {
      let problem = item.problem[j];
      problem.status_className = problem.status;
      if (
        problem.status === 'correct' &&
        problem.time === problem_list[j].first_solve_time
      ) {
        problem.status_className = 'firstsolve';
      }
    }
  }

  if (contest_config.organization) {
    let set = new Set();
    for (let i = 0; i < team_list.length; ++i) {
      let team = team_list[i];
      if (set.has(team.organization)) continue;
      team.organization_place = [...set].length + 1;
      set.add(team.organization);
    }
  }

  for (let i = 0; i < team_list.length; ++i) {
    team_list[i]['time'] = getDisplayTime(team_list[i]['time']);
  }

  return team_list;
}
