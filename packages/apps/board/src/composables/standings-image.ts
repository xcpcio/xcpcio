import type { AwardKey, ProblemColorClass } from "@board/composables/standings";
import type { Lang } from "@xcpcio/types";

import { DATA_HOST } from "@board/composables/constant";
import { getAwardKey, getProblemColorClass, getProblemShow, getProblemSign, getStandClassName } from "@board/composables/standings";
import { getImageSource, Rank, RankOptions } from "@xcpcio/core";
import cloneDeep from "lodash/cloneDeep";

const FONT_FAMILY = "Arial, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
// The live standings table uses `font-mono`; keep table text monospaced too.
const TABLE_FONT_FAMILY = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace, 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', sans-serif";
const PADDING = 32;
const TITLE_HEIGHT = 92;
const HEADER_HEIGHT = 52;
const ROW_HEIGHT = 54;
// The live table uses separate borders; keep the same background-coloured gaps
// between cells in the exported image.
const CELL_GAP = 2;
const ROW_PITCH = ROW_HEIGHT + CELL_GAP;
const FOOTER_HEIGHT = 40;
const BANNER_GAP = 18;
const ORG_LOGO_SIZE = ROW_HEIGHT;
const BRAND_LOGO_SIZE = 20;
const CORSFIX_PROXY_URL = "https://proxy.corsfix.com/?";
const ALLORIGINS_PROXY_URL = "https://api.allorigins.win/raw?url=";
const WSRV_PROXY_URL = "https://wsrv.nl/?url=";

interface StandingsTheme {
  background: string;
  text: string;
  muted: string;
  headerBackground: string;
  headerText: string;
  rows: Record<"stand00" | "stand01" | "stand10" | "stand11", string>;
  awards: Record<AwardKey, { background: string; text: string }>;
  problems: Record<ProblemColorClass, { background: string; text: string }>;
}

const LIGHT_THEME: StandingsTheme = {
  background: "#ffffff",
  text: "#111827",
  muted: "#6b7280",
  headerBackground: "#f5f5d5",
  headerText: "#111827",
  rows: {
    stand00: "#e0e0ff",
    stand01: "#e8e8ff",
    stand10: "#f8f8f8",
    stand11: "#f2f2f2",
  },
  awards: {
    gold: { background: "#fff566", text: "#111827" },
    silver: { background: "#ffadd2", text: "#111827" },
    bronze: { background: "#f0c0a0", text: "#111827" },
    honorable: { background: "#e6f7ff", text: "#111827" },
  },
  problems: {
    "first-solve": { background: "#3db03d", text: "#ffffff" },
    "correct": { background: "#e1ffb5", text: "#237804" },
    "incorrect": { background: "#ffd0d0", text: "#a8071a" },
    "pending": { background: "#c8d6fa", text: "#003eb3" },
    "unattempted": { background: "#ffffff", text: "#9ca3af" },
  },
};

const DARK_THEME: StandingsTheme = {
  background: "#1f2937",
  text: "#f3f4f6",
  muted: "#9ca3af",
  headerBackground: "#374151",
  headerText: "#f3f4f6",
  rows: {
    stand00: "#2d2d45",
    stand01: "#343550",
    stand10: "#3a3a4a",
    stand11: "#424252",
  },
  awards: {
    gold: { background: "#5c4a00", text: "#fde68a" },
    silver: { background: "#334155", text: "#e2e8f0" },
    bronze: { background: "#5a2a12", text: "#ffedd5" },
    honorable: { background: "#1e3a5f", text: "#dbeafe" },
  },
  problems: {
    "first-solve": { background: "#2aad2a", text: "#ffffff" },
    "correct": { background: "#2d6b1d", text: "#d9f7be" },
    "incorrect": { background: "#6b1d1d", text: "#ffccc7" },
    "pending": { background: "#2d3d5c", text: "#bae0ff" },
    "unattempted": { background: "#1f2937", text: "#6b7280" },
  },
};

export type StandingsImageTheme = "light" | "dark";

export interface StandingsImageLabels {
  place: string;
  team: string;
  solved: string;
  penalty: string;
  group: string;
  teams: string;
}

export interface StandingsImageOptions {
  teamCount: number;
  lang: Lang;
  theme: StandingsImageTheme;
  link: string;
  labels: StandingsImageLabels;
}

interface Column {
  key: string;
  width: number;
  align: "start" | "middle";
}

interface LoadedImageData {
  dataUrl: string;
  width: number;
  height: number;
}

let measureContext: CanvasRenderingContext2D | null | undefined;
const imageCache = new Map<string, Promise<LoadedImageData | undefined>>();

function getMeasureContext() {
  if (measureContext === undefined) {
    const canvas = document.createElement("canvas");
    measureContext = canvas.getContext("2d");
  }

  return measureContext;
}

function fontSpec(size: number, weight = 400, family = FONT_FAMILY) {
  return `${weight} ${size}px ${family}`;
}

function measureTextWidth(text: string, font: string) {
  const context = getMeasureContext();
  if (!context) {
    return text.length * 7;
  }

  context.font = font;
  return context.measureText(text).width;
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
  family?: string;
}) {
  return `<text x="${x}" y="${y}" fill="${options.fill}" font-family="${options.family ?? FONT_FAMILY}" font-size="${options.size}" font-weight="${options.weight ?? 400}" text-anchor="${options.anchor ?? "start"}" dominant-baseline="middle">${escapeXml(content)}</text>`;
}

function imageElement(href: string, x: number, y: number, width: number, height: number) {
  return `<image x="${x}" y="${y}" width="${width}" height="${height}" href="${escapeXml(href)}" preserveAspectRatio="xMidYMid meet" />`;
}

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load image"));
    image.src = url;
  });
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(blob);
  });
}

async function fetchImageData(url: string, proxyWidth?: number): Promise<LoadedImageData | undefined> {
  if (!url) {
    return undefined;
  }

  const isAbsoluteHttp = /^https?:\/\//.test(url);
  let isCrossOrigin = false;

  if (isAbsoluteHttp && typeof window !== "undefined") {
    try {
      isCrossOrigin = new URL(url).origin !== window.location.origin;
    } catch {
      isCrossOrigin = true;
    }
  }

  const fetchDirect = async () => {
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("Failed to fetch image");
    }
    return response.blob();
  };

  const fetchThroughCorsfix = async () => {
    if (!isAbsoluteHttp) {
      throw new Error("Image proxy requires an absolute URL");
    }

    const response = await fetch(`${CORSFIX_PROXY_URL}${url}`);
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("Failed to fetch image");
    }
    return response.blob();
  };

  const fetchThroughAllOrigins = async () => {
    if (!isAbsoluteHttp) {
      throw new Error("Image proxy requires an absolute URL");
    }

    const response = await fetch(`${ALLORIGINS_PROXY_URL}${encodeURIComponent(url)}`);
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("Failed to fetch image");
    }
    return response.blob();
  };

  const fetchThroughWsrv = async () => {
    if (!isAbsoluteHttp) {
      throw new Error("Image proxy requires an absolute URL");
    }

    const widthParam = proxyWidth
      ? `&w=${proxyWidth}&h=${proxyWidth}&fit=inside`
      : "";
    const response = await fetch(`${WSRV_PROXY_URL}${encodeURIComponent(url)}&output=png${widthParam}`);
    if (!response.ok || !response.headers.get("content-type")?.startsWith("image/")) {
      throw new Error("Failed to fetch image");
    }
    return response.blob();
  };

  const loaders: Array<() => Promise<Blob>> = isCrossOrigin
    ? [
        fetchThroughCorsfix,
        fetchThroughAllOrigins,
        fetchThroughWsrv,
        fetchDirect,
      ]
    : [
        fetchDirect,
        ...(isAbsoluteHttp
          ? [fetchThroughCorsfix, fetchThroughAllOrigins, fetchThroughWsrv]
          : []),
      ];

  let blob: Blob | undefined;
  for (const load of loaders) {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        blob = await load();
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 150 * (attempt + 1)));
      }
    }

    if (blob) {
      break;
    }
  }

  if (!blob) {
    return undefined;
  }

  try {
    const dataUrl = await blobToDataUrl(blob);
    const image = await loadImage(dataUrl);
    const naturalWidth = image.naturalWidth || 1;
    const naturalHeight = image.naturalHeight || 1;

    if (proxyWidth && Math.max(naturalWidth, naturalHeight) > proxyWidth) {
      const scale = proxyWidth / Math.max(naturalWidth, naturalHeight);
      const width = Math.max(1, Math.round(naturalWidth * scale));
      const height = Math.max(1, Math.round(naturalHeight * scale));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");

      if (context) {
        context.drawImage(image, 0, 0, width, height);
        return {
          dataUrl: canvas.toDataURL("image/png"),
          width,
          height,
        };
      }
    }

    return {
      dataUrl,
      width: naturalWidth,
      height: naturalHeight,
    };
  } catch {
    return undefined;
  }
}

function loadImageData(url: string, proxyWidth?: number) {
  if (!url) {
    return Promise.resolve(undefined);
  }

  const cacheKey = `${url}|${proxyWidth ?? ""}`;
  if (!imageCache.has(cacheKey)) {
    const promise = fetchImageData(url, proxyWidth).then((image) => {
      if (!image) {
        imageCache.delete(cacheKey);
      }

      return image;
    });

    imageCache.set(cacheKey, promise);
  }

  return imageCache.get(cacheKey) as Promise<LoadedImageData | undefined>;
}

async function loadImageMap(urls: string[], proxyWidth?: number) {
  const uniqueUrls = [
    ...new Set(urls.filter(Boolean)),
  ];
  const result = new Map<string, LoadedImageData>();
  let cursor = 0;

  async function worker() {
    while (cursor < uniqueUrls.length) {
      const url = uniqueUrls[cursor];
      cursor += 1;

      const image = await loadImageData(url, proxyWidth);
      if (image) {
        result.set(url, image);
      }
    }
  }

  await Promise.all(Array.from({
    length: Math.min(3, uniqueUrls.length),
  }, worker));
  return result;
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
  const theme = options.theme === "dark"
    ? DARK_THEME
    : LIGHT_THEME;
  const teams = rank.teams.slice(0, Math.max(0, Math.floor(options.teamCount)));
  const contestName = rank.contest.name.getOrDefault(options.lang);
  const groupName = rank.contest.group.get(rank.options.group)?.name.getOrDefault(options.lang) ?? rank.options.group;
  const showOrganization = rank.contest.options.enableOrganization;
  const problems = rank.contest.problems;

  const columns: Column[] = [
    { key: "place", width: 60, align: "middle" },
    {
      key: "team",
      width: showOrganization ? 460 : 240,
      align: "start",
    },
    { key: "solved", width: 70, align: "middle" },
    { key: "penalty", width: 84, align: "middle" },
    ...problems.map((_problem, index) => ({ key: `problem-${index}`, width: 56, align: "middle" as const })),
  ];

  const width = PADDING * 2 + columns.reduce((sum, column) => sum + column.width, 0);

  const bannerUrl = rank.contest.banner
    ? getImageSource(rank.contest.banner, DATA_HOST.value)
    : "";
  const organizationLogoUrls = showOrganization
    ? teams.map((team) => {
        return team.organization?.logo
          ? getImageSource(team.organization.logo, DATA_HOST.value)
          : "";
      })
    : [];

  const brandLogoUrl = typeof window !== "undefined"
    ? new URL("/favicon.svg", window.location.href).href
    : "";

  const [bannerData, logoMap, brandLogoData] = await Promise.all([
    bannerUrl
      ? loadImageData(bannerUrl)
      : Promise.resolve(undefined),
    loadImageMap(organizationLogoUrls, 128),
    brandLogoUrl
      ? loadImageData(brandLogoUrl)
      : Promise.resolve(undefined),
  ]);

  const bannerWidth = width - PADDING * 2;
  const bannerHeight = bannerData
    ? Math.min(280, Math.round(bannerWidth * bannerData.height / bannerData.width))
    : 0;
  const bannerBlockHeight = bannerData
    ? bannerHeight + BANNER_GAP
    : 0;
  const titleTop = PADDING + bannerBlockHeight;
  const tableTop = titleTop + TITLE_HEIGHT;
  const rowsTop = tableTop + HEADER_HEIGHT + CELL_GAP;
  const tableBottom = rowsTop + teams.length * ROW_PITCH - (teams.length > 0
    ? CELL_GAP
    : 0);
  const height = tableBottom + FOOTER_HEIGHT + PADDING;

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
    `<rect x="0" y="0" width="${width}" height="${height}" fill="${theme.background}" />`,
  ];

  if (bannerData) {
    parts.push(imageElement(bannerData.dataUrl, PADDING, PADDING, bannerWidth, bannerHeight));
  }

  parts.push(
    textElement(title, width / 2, titleTop + 18, {
      size: 30,
      weight: 700,
      fill: theme.text,
      anchor: "middle",
    }),
    textElement(subtitle, width / 2, titleTop + 54, {
      size: 15,
      fill: theme.muted,
      anchor: "middle",
    }),
  );

  const headerY = tableTop + HEADER_HEIGHT / 2;
  for (const column of columns) {
    const left = columnLefts.get(column.key) as number;
    const cellLeft = left + CELL_GAP / 2;
    const cellWidth = column.width - CELL_GAP;

    if (column.key.startsWith("problem-")) {
      const problem = problems[Number(column.key.slice("problem-".length))];
      parts.push(`<rect x="${cellLeft}" y="${tableTop}" width="${cellWidth}" height="${HEADER_HEIGHT}" fill="${problem.balloonColor.background_color}" />`);
      parts.push(textElement(problem.label, left + column.width / 2, tableTop + 18, {
        size: 13,
        weight: 700,
        fill: problem.balloonColor.color,
        anchor: "middle",
        family: TABLE_FONT_FAMILY,
      }));
      parts.push(textElement(String(problem.statistics.acceptedNum), left + column.width / 2, tableTop + 34, {
        size: 13,
        weight: 700,
        fill: problem.balloonColor.color,
        anchor: "middle",
        family: TABLE_FONT_FAMILY,
      }));
      continue;
    }

    parts.push(`<rect x="${cellLeft}" y="${tableTop}" width="${cellWidth}" height="${HEADER_HEIGHT}" fill="${theme.headerBackground}" />`);
    parts.push(textElement(options.labels[column.key as keyof StandingsImageLabels], left + column.width / 2, headerY, {
      size: 13,
      weight: 700,
      fill: theme.headerText,
      anchor: "middle",
      family: TABLE_FONT_FAMILY,
    }));
  }

  for (let index = 0; index < teams.length; index += 1) {
    const team = teams[index];
    const rowTop = rowsTop + index * ROW_PITCH;
    const rowMiddle = rowTop + ROW_HEIGHT / 2;
    const rowClass = getStandClassName(rank, team, index);
    const rowBackground = theme.rows[rowClass as keyof StandingsTheme["rows"]] ?? theme.background;
    const award = getAwardKey(team);

    for (const key of ["place", "team", "solved", "penalty"] as const) {
      const column = columns.find(item => item.key === key);
      if (!column) {
        continue;
      }

      const cellLeft = (columnLefts.get(key) as number) + CELL_GAP / 2;
      const background = key === "place" && award
        ? theme.awards[award].background
        : rowBackground;
      parts.push(`<rect x="${cellLeft}" y="${rowTop}" width="${column.width - CELL_GAP}" height="${ROW_HEIGHT}" fill="${background}" />`);
    }

    const placeLeft = columnLefts.get("place") as number;
    const placeWidth = columns[0].width;

    parts.push(textElement(String(team.rank), placeLeft + placeWidth / 2, rowMiddle, {
      size: 15,
      weight: 700,
      fill: award ? theme.awards[award].text : theme.text,
      anchor: "middle",
      family: TABLE_FONT_FAMILY,
    }));

    const teamLeft = columnLefts.get("team") as number;
    const teamWidth = columns.find(column => column.key === "team")?.width ?? 240;
    const organizationLogoUrl = showOrganization && team.organization?.logo
      ? getImageSource(team.organization.logo, DATA_HOST.value)
      : "";
    const organizationLogo = organizationLogoUrl
      ? logoMap.get(organizationLogoUrl)
      : undefined;
    const organizationName = showOrganization
      ? (team.organization?.name.getOrDefault(options.lang) ?? "")
      : "";
    const organizationText = organizationName && team.isFirstRankOfOrganization && team.organization
      ? `${team.organization.rank} ${organizationName}`
      : organizationName;
    const teamTextLeft = teamLeft + 12 + (organizationLogo
      ? ORG_LOGO_SIZE + 6
      : 0);
    const teamTextWidth = teamWidth - (teamTextLeft - teamLeft) - 12;
    const teamTextCenter = teamTextLeft + teamTextWidth / 2;

    if (organizationLogo) {
      parts.push(imageElement(organizationLogo.dataUrl, teamLeft + 12, rowMiddle - ORG_LOGO_SIZE / 2, ORG_LOGO_SIZE, ORG_LOGO_SIZE));
    }

    if (organizationText) {
      parts.push(textElement(truncateText(team.name.getOrDefault(options.lang), teamTextWidth, fontSpec(15, 600, TABLE_FONT_FAMILY)), teamTextCenter, rowMiddle - 8, {
        size: 15,
        weight: 600,
        fill: theme.text,
        anchor: "middle",
        family: TABLE_FONT_FAMILY,
      }));
      parts.push(textElement(truncateText(organizationText, teamTextWidth, fontSpec(12, 400, TABLE_FONT_FAMILY)), teamTextCenter, rowMiddle + 10, {
        size: 12,
        fill: theme.muted,
        anchor: "middle",
        family: TABLE_FONT_FAMILY,
      }));
    } else {
      parts.push(textElement(truncateText(team.name.getOrDefault(options.lang), teamTextWidth, fontSpec(15, 600, TABLE_FONT_FAMILY)), teamTextCenter, rowMiddle, {
        size: 15,
        weight: 600,
        fill: theme.text,
        anchor: "middle",
        family: TABLE_FONT_FAMILY,
      }));
    }

    const solvedLeft = columnLefts.get("solved") as number;
    const solvedWidth = columns.find(column => column.key === "solved")?.width ?? 70;
    parts.push(textElement(String(team.solvedProblemNum), solvedLeft + solvedWidth / 2, rowMiddle, {
      size: 15,
      weight: 700,
      fill: theme.text,
      anchor: "middle",
      family: TABLE_FONT_FAMILY,
    }));

    const penaltyLeft = columnLefts.get("penalty") as number;
    const penaltyWidth = columns.find(column => column.key === "penalty")?.width ?? 84;
    parts.push(textElement(String(team.penaltyToMinute), penaltyLeft + penaltyWidth / 2, rowMiddle, {
      size: 14,
      weight: 600,
      fill: theme.text,
      anchor: "middle",
      family: TABLE_FONT_FAMILY,
    }));

    for (let problemIndex = 0; problemIndex < problems.length; problemIndex += 1) {
      const p = team.problemStatistics[problemIndex];
      const column = columns.find(item => item.key === `problem-${problemIndex}`);
      const left = columnLefts.get(`problem-${problemIndex}`) as number;
      const colorClass = getProblemColorClass(p);
      const colors = theme.problems[colorClass];
      const cellWidth = column?.width ?? 48;

      if (colorClass === "unattempted") {
        continue;
      }

      parts.push(`<rect x="${left + CELL_GAP / 2}" y="${rowTop}" width="${cellWidth - CELL_GAP}" height="${ROW_HEIGHT}" fill="${colors.background}" />`);

      const sign = getProblemSign(p);
      const show = getProblemShow(p, rank.contest.statusTimeDisplay);
      if (sign.length > 0) {
        parts.push(textElement(sign, left + cellWidth / 2, rowMiddle - 8, {
          size: 12,
          weight: 700,
          fill: colors.text,
          anchor: "middle",
          family: TABLE_FONT_FAMILY,
        }));
      }

      if (show.length > 0) {
        parts.push(textElement(truncateText(show, cellWidth - 2, fontSpec(12, 700, TABLE_FONT_FAMILY)), left + cellWidth / 2, rowMiddle + 10, {
          size: 12,
          weight: 700,
          fill: colors.text,
          anchor: "middle",
          family: TABLE_FONT_FAMILY,
        }));
      }
    }
  }

  {
    const footerY = tableBottom + FOOTER_HEIGHT / 2 + 6;
    const dateText = `Generated ${generatedDate}`;
    const dateFont = fontSpec(12);
    const brandFont = fontSpec(13, 700);
    const linkFont = fontSpec(12);
    const brandText = "XCPCIO";
    const brandWidth = measureTextWidth(brandText, brandFont);
    const logoWidth = brandLogoData
      ? BRAND_LOGO_SIZE + 6
      : 0;
    const separatorWidth = 12;
    const maxLinkWidth = Math.max(80, width - PADDING * 2 - measureTextWidth(dateText, dateFont) - 24 - logoWidth - brandWidth - separatorWidth);
    const linkText = truncateText(options.link, maxLinkWidth, linkFont);
    const linkWidth = measureTextWidth(linkText, linkFont);
    const groupWidth = logoWidth + brandWidth + separatorWidth + linkWidth;
    const groupLeft = width - PADDING - groupWidth;
    let cursorX = groupLeft;

    if (brandLogoData) {
      parts.push(imageElement(brandLogoData.dataUrl, cursorX, footerY - BRAND_LOGO_SIZE / 2, BRAND_LOGO_SIZE, BRAND_LOGO_SIZE));
      cursorX += logoWidth;
    }

    parts.push(textElement(brandText, cursorX, footerY, {
      size: 13,
      weight: 700,
      fill: theme.text,
    }));
    cursorX += brandWidth + separatorWidth;

    parts.push(textElement(linkText, cursorX, footerY, {
      size: 12,
      fill: theme.muted,
    }));

    parts.push(textElement(dateText, PADDING, footerY, {
      size: 12,
      fill: theme.muted,
    }));
  }

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

    context.fillStyle = theme.background;
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
