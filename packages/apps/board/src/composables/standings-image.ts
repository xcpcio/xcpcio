import type { TeamProblemStatistics } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import { getAwardKey, getProblemColorClass, getProblemShow, getProblemSign } from "@board/composables/standings";
import { Rank, RankOptions } from "@xcpcio/core";
import cloneDeep from "lodash/cloneDeep";

const FONT_FAMILY = "Arial, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const PADDING = 32;
const TITLE_HEIGHT = 92;
const HEADER_HEIGHT = 52;
const ROW_HEIGHT = 54;
const FOOTER_HEIGHT = 36;

const COLORS = {
  background: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  border: "#e5e7eb",
  headerBackground: "#f3f4f6",
  alternateRow: "#fafafa",
};

const AWARD_COLORS = {
  gold: {
    background: "#fef3c7",
    text: "#92400e",
  },
  silver: {
    background: "#e2e8f0",
    text: "#334155",
  },
  bronze: {
    background: "#ffedd5",
    text: "#9a3412",
  },
  honorable: {
    background: "#f3f4f6",
    text: "#4b5563",
  },
};

const PROBLEM_COLORS = {
  "first-solve": {
    background: "#fff1b8",
    text: "#ad6800",
  },
  "correct": {
    background: "#d9f7be",
    text: "#237804",
  },
  "incorrect": {
    background: "#ffccc7",
    text: "#a8071a",
  },
  "pending": {
    background: "#bae0ff",
    text: "#003eb3",
  },
  "unattempted": {
    background: "#f5f5f5",
    text: "#bfbfbf",
  },
};

export interface StandingsImageLabels {
  place: string;
  team: string;
  organization: string;
  solved: string;
  penalty: string;
  group: string;
  teams: string;
}

export interface StandingsImageOptions {
  teamCount: number;
  lang: Lang;
  labels: StandingsImageLabels;
}

interface Column {
  key: string;
  width: number;
  align: "start" | "middle";
}

let measureContext: CanvasRenderingContext2D | null | undefined;

function getMeasureContext() {
  if (measureContext === undefined) {
    const canvas = document.createElement("canvas");
    measureContext = canvas.getContext("2d");
  }

  return measureContext;
}

function fontSpec(size: number, weight = 400) {
  return `${weight} ${size}px ${FONT_FAMILY}`;
}

function truncateText(text: string, maxWidth: number, font: string) {
  const context = getMeasureContext();
  if (!context) {
    return text;
  }

  context.font = font;
  if (context.measureText(text).width <= maxWidth) {
    return text;
  }

  const characters = [...text];
  let low = 0;
  let high = characters.length;

  while (low < high) {
    const middle = Math.ceil((low + high) / 2);
    const candidate = `${characters.slice(0, middle).join("")}…`;

    if (context.measureText(candidate).width <= maxWidth) {
      low = middle;
    } else {
      high = middle - 1;
    }
  }

  return `${characters.slice(0, low).join("")}…`;
}

function escapeXml(text: string) {
  return text.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&apos;",
  }[character] as string));
}

function textElement(content: string, x: number, y: number, options: {
  size: number;
  weight?: number;
  fill: string;
  anchor?: "start" | "middle" | "end";
}) {
  return `<text x="${x}" y="${y}" fill="${options.fill}" font-family="${FONT_FAMILY}" font-size="${options.size}" font-weight="${options.weight ?? 400}" text-anchor="${options.anchor ?? "start"}" dominant-baseline="middle">${escapeXml(content)}</text>`;
}

function getProblemCellColors(p: TeamProblemStatistics) {
  return PROBLEM_COLORS[getProblemColorClass(p)];
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to render standings image"));
    image.src = url;
  });
}

export function buildRankForGroup(sourceRank: Rank, group: string) {
  const contest = cloneDeep(sourceRank.contest);
  const rank = new Rank(contest, sourceRank.originTeams, sourceRank.getSubmissions());
  const options = new RankOptions();

  options.setGroup(group);
  rank.options = options;
  rank.buildRank();

  return rank;
}

export async function createStandingsImage(rank: Rank, options: StandingsImageOptions) {
  const teams = rank.teams.slice(0, Math.max(0, Math.floor(options.teamCount)));
  const contestName = rank.contest.name.getOrDefault(options.lang);
  const groupName = rank.contest.group.get(rank.options.group)?.name.getOrDefault(options.lang) ?? rank.options.group;
  const showOrganization = rank.contest.options.enableOrganization;
  const problems = rank.contest.problems;

  const columns: Column[] = [
    { key: "place", width: 64, align: "middle" },
    { key: "team", width: 240, align: "start" },
    ...(showOrganization ? [{ key: "organization", width: 210, align: "start" as const }] : []),
    { key: "solved", width: 76, align: "middle" },
    { key: "penalty", width: 92, align: "middle" },
    ...problems.map((_problem, index) => ({ key: `problem-${index}`, width: 48, align: "middle" as const })),
  ];

  const width = PADDING * 2 + columns.reduce((sum, column) => sum + column.width, 0);
  const height = PADDING * 2 + TITLE_HEIGHT + HEADER_HEIGHT + teams.length * ROW_HEIGHT + FOOTER_HEIGHT;
  const tableTop = PADDING + TITLE_HEIGHT;
  const tableBottom = tableTop + HEADER_HEIGHT + teams.length * ROW_HEIGHT;
  const columnLefts = new Map<string, number>();
  let currentLeft = PADDING;

  for (const column of columns) {
    columnLefts.set(column.key, currentLeft);
    currentLeft += column.width;
  }

  const titleFont = fontSpec(30, 700);
  const title = truncateText(contestName, width - PADDING * 2, titleFont);
  const subtitle = truncateText(`${options.labels.group}: ${groupName} · ${options.labels.teams}: ${teams.length} / ${rank.teams.length}`, width - PADDING * 2, fontSpec(15));
  const generatedDate = new Date().toISOString().slice(0, 10);

  const parts: string[] = [
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${COLORS.background}" />`,
    textElement(title, PADDING, PADDING + 18, {
      size: 30,
      weight: 700,
      fill: COLORS.text,
    }),
    textElement(subtitle, PADDING, PADDING + 54, {
      size: 15,
      fill: COLORS.muted,
    }),
    `<rect x="${PADDING}" y="${tableTop}" width="${width - PADDING * 2}" height="${HEADER_HEIGHT}" fill="${COLORS.headerBackground}" />`,
  ];

  const headerY = tableTop + HEADER_HEIGHT / 2;
  for (const column of columns) {
    const left = columnLefts.get(column.key) as number;
    if (column.key.startsWith("problem-")) {
      const problem = problems[Number(column.key.slice("problem-".length))];
      const x = left + 3;
      const y = tableTop + 6;
      parts.push(`<rect x="${x}" y="${y}" width="${column.width - 6}" height="${HEADER_HEIGHT - 12}" rx="5" fill="${problem.balloonColor.background_color}" />`);
      parts.push(textElement(problem.label, left + column.width / 2, headerY, {
        size: 14,
        weight: 700,
        fill: problem.balloonColor.color,
        anchor: "middle",
      }));
      continue;
    }

    const label = options.labels[column.key as keyof StandingsImageLabels];
    const x = column.align === "middle" ? left + column.width / 2 : left + 12;
    parts.push(textElement(label, x, headerY, {
      size: 13,
      weight: 700,
      fill: COLORS.text,
      anchor: column.align,
    }));
  }

  for (let index = 0; index < teams.length; index += 1) {
    const team = teams[index];
    const rowTop = tableTop + HEADER_HEIGHT + index * ROW_HEIGHT;
    const rowMiddle = rowTop + ROW_HEIGHT / 2;

    if (index % 2 === 1) {
      parts.push(`<rect x="${PADDING}" y="${rowTop}" width="${width - PADDING * 2}" height="${ROW_HEIGHT}" fill="${COLORS.alternateRow}" />`);
    }

    const award = getAwardKey(team);
    const placeLeft = columnLefts.get("place") as number;
    const placeWidth = columns[0].width;

    if (award) {
      parts.push(`<rect x="${placeLeft + (placeWidth - 36) / 2}" y="${rowMiddle - 15}" width="36" height="30" rx="6" fill="${AWARD_COLORS[award].background}" />`);
      parts.push(textElement(String(team.rank), placeLeft + placeWidth / 2, rowMiddle, {
        size: 15,
        weight: 700,
        fill: AWARD_COLORS[award].text,
        anchor: "middle",
      }));
    } else {
      parts.push(textElement(String(team.rank), placeLeft + placeWidth / 2, rowMiddle, {
        size: 15,
        weight: 700,
        fill: COLORS.text,
        anchor: "middle",
      }));
    }

    const teamLeft = columnLefts.get("team") as number;
    const teamWidth = columns.find(column => column.key === "team")?.width ?? 240;
    parts.push(textElement(truncateText(team.name.getOrDefault(options.lang), teamWidth - 24, fontSpec(15, 600)), teamLeft + 12, rowMiddle, {
      size: 15,
      weight: 600,
      fill: COLORS.text,
    }));

    if (showOrganization) {
      const organizationLeft = columnLefts.get("organization") as number;
      const organizationWidth = columns.find(column => column.key === "organization")?.width ?? 210;
      const organizationName = team.organization?.name.getOrDefault(options.lang) ?? "";
      parts.push(textElement(truncateText(organizationName, organizationWidth - 24, fontSpec(12)), organizationLeft + 12, rowMiddle, {
        size: 12,
        fill: COLORS.muted,
      }));
    }

    const solvedLeft = columnLefts.get("solved") as number;
    const solvedWidth = columns.find(column => column.key === "solved")?.width ?? 76;
    parts.push(textElement(String(team.solvedProblemNum), solvedLeft + solvedWidth / 2, rowMiddle, {
      size: 15,
      weight: 700,
      fill: COLORS.text,
      anchor: "middle",
    }));

    const penaltyLeft = columnLefts.get("penalty") as number;
    const penaltyWidth = columns.find(column => column.key === "penalty")?.width ?? 92;
    parts.push(textElement(String(team.penaltyToMinute), penaltyLeft + penaltyWidth / 2, rowMiddle, {
      size: 14,
      weight: 600,
      fill: COLORS.text,
      anchor: "middle",
    }));

    for (let problemIndex = 0; problemIndex < problems.length; problemIndex += 1) {
      const p = team.problemStatistics[problemIndex];
      const column = columns.find(item => item.key === `problem-${problemIndex}`);
      const left = columnLefts.get(`problem-${problemIndex}`) as number;
      const colors = getProblemCellColors(p);

      parts.push(`<rect x="${left + 2}" y="${rowTop + 3}" width="${(column?.width ?? 48) - 4}" height="${ROW_HEIGHT - 6}" rx="4" fill="${colors.background}" />`);

      const sign = getProblemSign(p);
      const show = getProblemShow(p, rank.contest.statusTimeDisplay);
      if (sign.length > 0) {
        parts.push(textElement(sign, left + (column?.width ?? 48) / 2, rowMiddle - 8, {
          size: 13,
          weight: 700,
          fill: colors.text,
          anchor: "middle",
        }));
      }

      if (show.length > 0) {
        parts.push(textElement(truncateText(show, (column?.width ?? 48) - 6, fontSpec(11)), left + (column?.width ?? 48) / 2, rowMiddle + 10, {
          size: 11,
          fill: colors.text,
          anchor: "middle",
        }));
      }
    }
  }

  parts.push(`<line x1="${PADDING}" y1="${tableTop}" x2="${width - PADDING}" y2="${tableTop}" stroke="${COLORS.border}" />`);
  parts.push(`<line x1="${PADDING}" y1="${tableBottom}" x2="${width - PADDING}" y2="${tableBottom}" stroke="${COLORS.border}" />`);

  for (let index = 1; index < columns.length; index += 1) {
    const x = columnLefts.get(columns[index].key) as number;
    parts.push(`<line x1="${x}" y1="${tableTop}" x2="${x}" y2="${tableBottom}" stroke="${COLORS.border}" />`);
  }

  for (let index = 0; index <= teams.length; index += 1) {
    const y = tableTop + HEADER_HEIGHT + index * ROW_HEIGHT;
    parts.push(`<line x1="${PADDING}" y1="${y}" x2="${width - PADDING}" y2="${y}" stroke="${COLORS.border}" />`);
  }

  parts.push(textElement(`XCPCIO · ${generatedDate}`, width - PADDING, tableBottom + FOOTER_HEIGHT / 2 + 8, {
    size: 12,
    fill: COLORS.muted,
    anchor: "end",
  }));

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    ...parts,
    "</svg>",
  ].join("");

  const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  try {
    const image = await loadImage(url);
    const pixelArea = width * height;
    const scale = Math.max(0.35, Math.min(2, Math.sqrt(16_000_000 / pixelArea), 30_000 / Math.max(width, height)));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Failed to create standings image");
    }

    context.fillStyle = COLORS.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.scale(scale, scale);
    context.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/png");
    });

    if (!blob) {
      throw new Error("Failed to create standings image");
    }

    return blob;
  } finally {
    URL.revokeObjectURL(url);
  }
}
