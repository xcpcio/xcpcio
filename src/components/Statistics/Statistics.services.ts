import { Run } from "@/types/submission";
import { isAccepted, isWrongAnswer, isPending } from "@/utils/submission";

export const timerInterval = 200;

function getChartObj(
  title: string,
  xText: string,
  yText: string,
  cat: any,
  series: any,
  colors: any,
) {
  return {
    colors: colors,
    chart:
      window.innerWidth < 992
        ? {
            type: "bar",
            backgroundColor: "transparent",
          }
        : {
            type: "column",
            backgroundColor: "transparent",
            height: "420px",
          },
    title: {
      text: title,
    },
    xAxis: {
      categories: cat,
      labels: {
        style: {
          fontSize: "16px",
        },
      },
      title: {
        text: xText,
        style: {
          fontSize: "16px",
        },
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: yText,
        style: {
          fontSize: "16px",
          height: "320px",
        },
      },
      stackLabels: {
        enabled: true,
        style: {
          fontSize: "16px",
        },
      },
    },
    tooltip: {
      enabled: true,
      headerFormat: "",
      pointFormat: "{series.name}：{point.y}",
    },
    plotOptions: {
      bar: {
        stacking: "normal",
      },
      column: {
        stacking: "normal",
      },
    },
    credits: {
      enabled: false,
    },
    series: series,
  };
}

function getTeamAndProblemId(
  team_id: number | string,
  problem_id: number | string,
): string {
  return [team_id, problem_id].join("-#@!-");
}

export function getProblemChart(contest_config: any, team: any, run: Run[]) {
  let problem_list: any = [];

  contest_config.problem_id.forEach((problem_id: any, index: number) => {
    problem_list.push({
      problem_id: problem_id,
      index: index,
      solved: 0,
    });
  });

  (() => {
    let set = new Set();

    run.forEach((run: Run) => {
      if (isAccepted(run.status)) {
        const id = getTeamAndProblemId(run.teamId, run.problemId);

        if (!set.has(id)) {
          set.add(id);
          problem_list[run.problemId].solved += 1;
        }
      }
    });
  })();

  problem_list.sort((a: any, b: any) => {
    if (a.solved > b.solved) return -1;
    if (a.solved < b.solved) return 1;
    if (a.index < b.index) return -1;
    if (a.index > b.index) return 1;
    return 0;
  });

  let { cat, series, colors } = (() => {
    let cat: any = [];
    let data: any = [];

    problem_list.forEach((problem: any) => {
      cat.push(problem.problem_id);
      data.push(problem.solved);
    });

    const series = [
      {
        name: "队伍数",
        showInLegend: false,
        data: data,
      },
    ];

    const colors = ["rgb(124, 181, 236)"];
    return { cat, series, colors };
  })();

  return getChartObj(
    "题目通过数统计",
    "题目编号",
    "通过数",
    cat,
    series,
    colors,
  );
}

export function getTeamChart(contest_config: any, team: any, run: Run[]) {
  let team_list: any = {};

  for (let team_id in team) {
    team_list[team_id] = {
      solved: 0,
    };
  }

  (() => {
    let set = new Set();

    run.forEach((run: Run) => {
      if (isAccepted(run.status)) {
        const id = getTeamAndProblemId(run.teamId, run.problemId);
        if (!set.has(id)) {
          set.add(id);
          team_list[run.teamId].solved += 1;
        }
      }
    });
  })();

  let num = (() => {
    const len = contest_config?.problem_id?.length;
    let num: any = [];

    for (let i = 0; i <= len; ++i) {
      num[i] = {
        index: i,
        cnt: 0,
      };
    }

    for (let team_id in team_list) {
      num[team_list[team_id].solved].cnt += 1;
    }

    return num;
  })();

  let { cat, series, colors } = (() => {
    let cat: any = [];
    let data: any = [];

    num.forEach((num: any) => {
      cat.push(num.index);
      data.push(num.cnt);
    });

    const series = [
      {
        name: "队伍数",
        showInLegend: false,
        data: data,
      },
    ];

    const colors = ["rgb(124, 181, 236)"];
    return { cat, series, colors };
  })();

  return getChartObj("队伍过题数统计", "过题数", "队伍数", cat, series, colors);
}

export function getSubmitChart(contest_config: any, team: any, run: Run[]) {
  let { cat, series, colors } = (() => {
    let cat: any = [];
    let Accepted: any = [];
    let Rejected: any = [];
    let Pending: any = [];

    contest_config.problem_id.forEach((problem_id: any, index: number) => {
      Accepted.push(0);
      Rejected.push(0);
      Pending.push(0);
      cat.push(problem_id);
    });

    run.forEach((run: Run) => {
      if (isAccepted(run.status)) {
        Accepted[run.problemId] += 1;
      }

      if (isWrongAnswer(run.status)) {
        Rejected[run.problemId] += 1;
      }

      if (isPending(run.status)) {
        Pending[run.problemId] += 1;
      }
    });

    const series = [
      {
        name: "Accepted",
        showInLegend: false,
        data: Accepted,
      },
      {
        name: "Rejected",
        showInLegend: false,
        data: Rejected,
      },
      {
        name: "Pending",
        showInLegend: false,
        data: Pending,
      },
    ];

    const colors = ["#E1FFB5", "#FFD0D0", "#C8D6FA"];
    return { cat, series, colors };
  })();

  return getChartObj("提交分类统计", "题目编号", "提交数", cat, series, colors);
}
