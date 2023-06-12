import { Run } from "@/types/submission";
import { isAccepted } from "@/core/submission";

export const height = 400;
export const timerInterval = 250;
const INF = 0x3f3f3f3f;

function getSolvedAndTime(problem: any) {
  let solved = 0,
    time = 0;
  problem.forEach((problem: any) => {
    if (problem.solved === 1) {
      solved += 1;
      time += problem.time;
    }
  });
  return { solved: solved, time: time };
}

function comp(a: any, b: any) {
  if (a.solved > b.solved) return 1;
  if (a.solved == b.solved && a.time < b.time) return 1;
  return 0;
}

interface PlaceChartsItem {
  x: number;
  y: number;
  last_solved: string;
}

function getTeamPlace(contest_config: any, cur_team: any, team: any, run: Run[]) {
  let data: PlaceChartsItem[] = [];

  run.sort((a: Run, b: Run) => {
    if (a.timestamp < b.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    return 0;
  });

  const duration = Math.floor((contest_config.end_time - contest_config.start_time) / 60);

  let teams: any = {};

  for (let k in team) {
    teams[k] = {};
    teams[k]["problem"] = [];
    contest_config.problem_id.forEach((problem_id: any) => {
      let problem: any = {};
      problem["problem_id"] = problem_id;
      problem["solved"] = 0;
      problem["time"] = 0;
      teams[k].problem.push(problem);
    });
  }

  const run_len = run.length;
  let pos = 0;
  let last_solved = "";

  for (let i = 0; i <= duration; ++i) {
    while (pos < run_len && run[pos].timestamp <= i * 60) {
      let run_item = run[pos];
      let team_id = run_item.teamId;
      let status = run_item.status;
      let problem_id = run_item.problemId;
      let time = run_item.timestamp;

      if (isAccepted(status)) {
        teams[team_id].problem[problem_id].solved = 1;
        teams[team_id].problem[problem_id].time += time;
        if (team_id == cur_team.team_id) {
          last_solved = `Last Solved Problem ${contest_config.problem_id[problem_id]}.`;
        }
      } else {
        teams[team_id].problem[problem_id].time += time;
      }
      ++pos;
    }

    let cur_team_data = getSolvedAndTime(teams[cur_team.team_id].problem);
    let place = 1;

    for (let k in teams) {
      if (k !== cur_team.team_id) {
        let team = teams[k];
        let team_data = getSolvedAndTime(team.problem);
        place += comp(team_data, cur_team_data);
      }
    }

    data.push({ x: i, y: place, last_solved: last_solved });
  }

  //平滑处理
  let _data: PlaceChartsItem[] = [];
  _data.push(data[0]);
  for (let i = 1; i < data.length - 1; ++i) {
    if (data[i].y !== _data[_data.length - 1].y || data[i].last_solved !== _data[_data.length - 1].last_solved) {
      _data.push(data[i]);
    }
  }
  _data.push(data[data.length - 1]);
  return _data;
}

export function getHichartsOptions(contest_config: any, cur_team: any, team: any, run: any) {
  const options: Highcharts.Options = {
    chart: {
      type: "spline",
    },
    title: {
      text: "排名变化趋势图",
    },
    series: [
      {
        showInLegend: false,
        allowPointSelect: false,
        name: "排名",
        type: "spline",
        data: getTeamPlace(contest_config, cur_team, team, run),
      },
    ],
    xAxis: [
      {
        allowDecimals: false,
        title: {
          text: "时间",
        },
      },
    ],
    yAxis: [
      {
        allowDecimals: false,
        reversed: true,
        title: {
          text: "排名",
        },
        gridLineWidth: 1,
      },
    ],
    plotOptions: {
      line: {
        color: "#efbc47",
        dataLabels: {
          enabled: false,
        },
        enableMouseTracking: true,
        marker: {
          enabled: true,
          fillColor: "#fff566",
        },
      },
    },
    tooltip: {
      enabled: true,
      headerFormat: "",
      pointFormat: "Time：{point.x} <br/> Place：{point.y} <br/> {point.last_solved}",
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
    },
    navigation: {
      menuItemStyle: {
        fontSize: "10px",
      },
    },
  };
  return options;
}
