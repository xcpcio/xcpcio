import type { Rank, Team } from "@xcpcio/core";
import { getTimeDiff } from "@xcpcio/core";

function getChartObj(title: string, xText: string, yText: string, cat: any, series: any, colors: any) {
  return {
    colors,
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
    series,
  };
}

export function getProblemChart(rank: Rank) {
  const problemList: any = [];

  rank.contest.problems.forEach((p, ix) => {
    problemList.push({
      problem_id: p.label,
      index: ix,
      solved: p.statistics.acceptedNum,
    });
  });

  problemList.sort((a: any, b: any) => {
    if (a.solved > b.solved) {
      return -1;
    }

    if (a.solved < b.solved) {
      return 1;
    }

    if (a.index < b.index) {
      return -1;
    }

    if (a.index > b.index) {
      return 1;
    }

    return 0;
  });

  const { cat, series, colors } = (() => {
    const cat: any = [];
    const data: any = [];

    problemList.forEach((problem: any) => {
      cat.push(problem.problem_id);
      data.push(problem.solved);
    });

    const series = [
      {
        name: "队伍数",
        showInLegend: false,
        data,
      },
    ];

    const colors = ["rgb(124, 181, 236)"];
    return { cat, series, colors };
  })();

  return getChartObj("题目通过数", "题目编号", "通过数", cat, series, colors);
}

export function getTeamChart(rank: Rank) {
  const num = rank.rankStatistics.teamSolvedNum.map((n, ix) => {
    return {
      index: ix,
      cnt: n,
    };
  });

  const { cat, series, colors } = (() => {
    const cat: any = [];
    const data: any = [];

    num.forEach((num: any) => {
      cat.push(num.index);
      data.push(num.cnt);
    });

    const series = [
      {
        name: "队伍数",
        showInLegend: false,
        data,
      },
    ];

    const colors = ["rgb(124, 181, 236)"];
    return { cat, series, colors };
  })();

  return getChartObj("队伍过题数", "过题数", "队伍数", cat, series, colors);
}

export function getSubmitChart(rank: Rank) {
  const { cat, series, colors } = (() => {
    const cat: any = [];
    const Accepted: any = [];
    const Rejected: any = [];
    const Pending: any = [];

    rank.contest.problems.forEach((p) => {
      Accepted.push(p.statistics.acceptedNum);
      Rejected.push(p.statistics.rejectedNum);
      Pending.push(p.statistics.pendingNum);
      cat.push(p.label);
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

  return getChartObj("提交分类", "题目编号", "提交数", cat, series, colors);
}

export function getTeamPlaceChart(_rank: Rank, team: Team) {
  const data = team.placeChartPoints.map((p) => {
    return {
      x: p.timePoint,
      y: p.rank,
      showX: getTimeDiff(p.timePoint),
      lastSolved: p.lastSolvedProblem?.label ? `Last Solved Problem ${p.lastSolvedProblem?.label}` : "",
    };
  });

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
        name: "rank",
        type: "spline",
        data,
        marker: {
          symbol: "circle",
          radius: 4,
          lineWidth: 2,
          fillColor: "yellow",
          lineColor: "yellow",
        },
      },
    ],
    xAxis: [
      {
        allowDecimals: false,
        title: {
          text: "Time(min)",
        },
        crosshair: true,
      },
    ],
    yAxis: [
      {
        allowDecimals: false,
        title: {
          text: "Place",
        },
        reversed: true,
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
      pointFormat: "Time: {point.showX} <br/> Place: {point.y} <br/> {point.lastSolved}",
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
