import type { RatingUser } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { RatingLevelToString, RatingUtility } from "@xcpcio/core";

interface RatingGraphData {
  x: number;
  y: number;
  rank: number;
  diffRating: string;
  ratingTitle: string;
  contestName: string;
  contestTime: string;
  teamName: string;
  link?: string;
}

function getDiffRating(oldRating: number, newRating: number) {
  const diff = newRating - oldRating;
  if (newRating > oldRating) {
    return `+${diff.toString()}`;
  } else {
    return diff.toString();
  }
}

export function getRatingGraphOptions(
  ratingUser: RatingUser,
) {
  const data: RatingGraphData[] = [];

  const { locale } = useI18n();
  const lang = locale.value as unknown as Lang;

  {
    let oldRating = 0;
    for (const h of ratingUser.ratingHistories) {
      const d: RatingGraphData = {} as RatingGraphData;
      d.x = h.contestTime.unix() * 1000;
      d.y = h.rating;
      d.diffRating = getDiffRating(oldRating, h.rating);
      d.rank = h.rank;
      d.contestName = h.contestName.getOrDefault(lang);
      d.link = `/board/${h.contestID}`;
      d.contestTime = h.contestTime.format("YYYY-MM-DD HH:mm:ss");
      d.teamName = h.teamName.getOrDefault(lang);
      d.ratingTitle = RatingLevelToString[RatingUtility.getRatingLevel(h.rating)];
      data.push(d);

      oldRating = h.rating;
    }
  }

  let tickPositions = [
    1200,
    1400,
    1600,
    1900,
    2100,
    2300,
    2400,
    2600,
    3000,
  ];

  {
    const gap = 100;
    let minRating = Math.max(0, ratingUser.minRating - gap);
    let maxRating = ratingUser.maxRating + gap;

    for (let i = 0; i < tickPositions.length; ++i) {
      if (tickPositions[i] > maxRating) {
        maxRating = tickPositions[i];
        break;
      }
    }
    for (let i = tickPositions.length - 1; i >= 0; --i) {
      if (tickPositions[i] < minRating) {
        minRating = tickPositions[i];
        break;
      }
    }
    if (minRating < 1200) {
      tickPositions = [minRating, ...tickPositions];
    }
    if (maxRating > 3000) {
      tickPositions.push(maxRating);
    }

    tickPositions = tickPositions.filter(
      x => x >= minRating && x <= maxRating,
    );
  }

  const options = {
    chart: {
      type: "line",
      height: "408px",
    },
    title: {
      text: null,
    },
    xAxis: {
      tickWidth: 0,
      gridLineWidth: 0.4,
      minRange: 30 * 24 * 60 * 60 * 1000,
      type: "datetime",
      showFirstLabel: true,
      showLastLabel: true,
      dateTimeLabelFormats: {
        month: "%b %Y",
      },
    },
    yAxis: {
      showEmpty: false,
      showFirstLabel: false,
      showLastLabel: false,
      tickPositions,
      tickWidth: 0,
      gridLineWidth: 0.6,
      labels: {
        enabled: true,
        format: "{value}",
      },
      title: {
        text: null,
      },
      plotBands: [
        {
          from: 0,
          to: 1199,
          color: "#CCCCCC",
        },
        {
          from: 1200,
          to: 1399,
          color: "#98FA87",
        },
        {
          from: 1400,
          to: 1599,
          color: "#90DABD",
        },
        {
          from: 1600,
          to: 1899,
          color: "#A9ACF9",
        },
        {
          from: 1900,
          to: 2099,
          color: "#EF91F9",
        },
        {
          from: 2100,
          to: 2299,
          color: "#F7CD91",
        },
        {
          from: 2300,
          to: 2399,
          color: "#F5BD67",
        },
        {
          from: 2400,
          to: 2599,
          color: "#Ef7F7B",
        },
        {
          from: 2600,
          to: 2999,
          color: "#EB483F",
        },
        {
          from: 3000,
          to: 0x3F3F3F3F,
          color: "#9C1E14",
        },
      ],
    },
    credits: {
      enabled: false,
    },
    plotOptions: {
      line: {
        color: "#ffec3d",
        dataLabels: {
          enabled: false,
        },
        enableMouseTracking: true,
        marker: {
          enabled: true,
          fillColor: "#fffb8f",
        },
      },
    },
    tooltip: {
      enabled: true,
      headerFormat: "",
      useHTML: true,
      shared: true,
      shadow: true,
      followPointer: false,
      followTouchMove: false,
      pointFormat: `= {point.y} ({point.diffRating}), {point.ratingTitle}
              <br/>Rank: {point.rank}
              <br/>TeamName: {point.teamName}
              <br/>ContestTime: {point.contestTime}
              <br/><a href="{point.link}">{point.contestName}</a>
              <br/>`,
    },
    series: [
      {
        showInLegend: false,
        allowPointSelect: true,
        // name: ratingUser.name,
        data,
      },
    ],
  };
  return options;
}
