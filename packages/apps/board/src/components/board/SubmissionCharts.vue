<script setup lang="ts">
import type { Submissions } from "@xcpcio/core";
import type { SubmissionStatus } from "@xcpcio/types";
import type { Options } from "highcharts";

import { SubmissionStatus as Status, SubmissionStatusToString } from "@xcpcio/types";
import { Chart } from "highcharts-vue";

const props = defineProps<{
  submissions: Submissions;
  durationMinutes: number;
}>();

const { t } = useI18n();
const isMobileLayout = useMediaQuery("(max-width: 1023.98px)");

const STATUS_COLOR_VARS: Partial<Record<SubmissionStatus, string>> = {
  [Status.ACCEPTED]: "--theme-status-accepted",
  [Status.CORRECT]: "--theme-status-accepted",
  [Status.PARTIALLY_CORRECT]: "--theme-status-partially-correct",
  [Status.REJECTED]: "--theme-status-wrong-answer",
  [Status.WRONG_ANSWER]: "--theme-status-wrong-answer",
  [Status.NO_OUTPUT]: "--theme-status-wrong-answer",
  [Status.HACKED]: "--theme-status-wrong-answer",
  [Status.COMPILATION_ERROR]: "--theme-status-compilation-error",
  [Status.PRESENTATION_ERROR]: "--theme-status-compilation-error",
  [Status.RUNTIME_ERROR]: "--theme-status-runtime-error",
  [Status.TIME_LIMIT_EXCEEDED]: "--theme-status-time-limit-exceeded",
  [Status.MEMORY_LIMIT_EXCEEDED]: "--theme-status-memory-limit-exceeded",
  [Status.OUTPUT_LIMIT_EXCEEDED]: "--theme-status-output-limit-exceeded",
  [Status.IDLENESS_LIMIT_EXCEEDED]: "--theme-status-output-limit-exceeded",
  [Status.PENDING]: "--theme-status-pending",
  [Status.FROZEN]: "--theme-status-pending",
  [Status.WAITING]: "--theme-status-waiting",
  [Status.PREPARING]: "--theme-status-preparing",
  [Status.COMPILING]: "--theme-status-compiling",
  [Status.RUNNING]: "--theme-status-running",
  [Status.JUDGING]: "--theme-status-running",
  [Status.JUDGEMENT_FAILED]: "--theme-status-judgement-failed",
  [Status.SECURITY_VIOLATED]: "--theme-status-judgement-failed",
  [Status.DENIAL_OF_JUDGEMENT]: "--theme-status-judgement-failed",
  [Status.CONFIGURATION_ERROR]: "--theme-status-configuration-error",
  [Status.FILE_ERROR]: "--theme-status-file-error",
  [Status.SYSTEM_ERROR]: "--theme-status-system-error",
  [Status.CANCELED]: "--theme-status-canceled",
  [Status.SKIPPED]: "--theme-status-skipped",
  [Status.UNKNOWN]: "--theme-status-unknown",
  [Status.UNDEFINED]: "--theme-status-undefined",
};

const FALLBACK_COLORS = {
  light: { status: "#64748b" },
  dark: { status: "#94a3b8" },
};

function readCssColor(variable: string, fallback: string) {
  if (typeof window === "undefined") {
    return fallback;
  }
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim() || fallback;
}

const statusColors = computed<Partial<Record<SubmissionStatus, string>>>(() => {
  const theme = isDark.value ? "dark" : "light";
  return Object.fromEntries(
    Object.entries(STATUS_COLOR_VARS).map(([status, variable]) => [
      status,
      readCssColor(variable!, FALLBACK_COLORS[theme].status),
    ]),
  ) as Partial<Record<SubmissionStatus, string>>;
});

const verdictOptions = computed<Options>(() => {
  const isMobile = isMobileLayout.value;
  const counts = new Map<SubmissionStatus, number>();
  for (const submission of props.submissions) {
    counts.set(submission.status, (counts.get(submission.status) ?? 0) + 1);
  }

  const data = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({
      name: SubmissionStatusToString[status] ?? status,
      y: count,
      color: statusColors.value[status],
    }));

  return {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      ...(isMobile ? { height: 300 } : {}),
    },
    title: {
      text: t("submission_statistics.verdict_title"),
      ...(isMobile ? { style: { fontSize: "14px" } } : {}),
    },
    tooltip: {
      pointFormat: "<b>{point.y}</b> ({point.percentage:.1f}%)",
    },
    ...(isMobile
      ? {
          legend: {
            itemStyle: {
              fontSize: "10px",
            },
          },
        }
      : {}),
    plotOptions: {
      pie: {
        innerSize: "45%",
        dataLabels: {
          ...(isMobile ? { enabled: false } : {}),
          format: "{point.name}: {point.y}",
        },
      },
    },
    series: [
      {
        name: t("submission_statistics.submissions"),
        data,
      },
    ],
    credits: {
      enabled: false,
    },
  };
});

const timeOptions = computed<Options>(() => {
  const isMobile = isMobileLayout.value;
  const bucketSize = 10;
  const bucketCount = Math.max(1, Math.ceil((Number.isFinite(props.durationMinutes) ? props.durationMinutes : 0) / bucketSize));

  const byStatus = new Map<SubmissionStatus, number[]>();
  const totals = new Map<SubmissionStatus, number>();

  for (const submission of props.submissions) {
    let counts = byStatus.get(submission.status);
    if (!counts) {
      counts = Array.from<number>({ length: bucketCount }).fill(0);
      byStatus.set(submission.status, counts);
    }

    const index = Math.min(Math.max(Math.floor(submission.timestampToMinute / bucketSize), 0), bucketCount - 1);
    counts[index]++;
    totals.set(submission.status, (totals.get(submission.status) ?? 0) + 1);
  }

  const categories = Array.from({ length: bucketCount }, (_, index) => `${index * bucketSize}-${(index + 1) * bucketSize}`);
  const series = [...byStatus.keys()]
    .sort((a, b) => (totals.get(b) ?? 0) - (totals.get(a) ?? 0))
    .map((status) => {
      return {
        name: SubmissionStatusToString[status] ?? status,
        data: byStatus.get(status)!,
        color: statusColors.value[status],
      };
    });

  return {
    chart: {
      type: "column",
      backgroundColor: "transparent",
      ...(isMobile ? { height: 320 } : {}),
    },
    title: {
      text: t("submission_statistics.over_time_title"),
      ...(isMobile ? { style: { fontSize: "14px" } } : {}),
    },
    xAxis: {
      categories,
      ...(isMobile
        ? {
            labels: {
              step: 2,
              rotation: -45,
              style: {
                fontSize: "9px",
              },
            },
          }
        : {}),
      title: {
        text: t("submission_statistics.minutes"),
        ...(isMobile ? { style: { fontSize: "11px" } } : {}),
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: t("submission_statistics.submissions"),
        ...(isMobile ? { style: { fontSize: "11px" } } : {}),
      },
    },
    ...(isMobile
      ? {
          legend: {
            itemStyle: {
              fontSize: "10px",
            },
          },
        }
      : {}),
    tooltip: {
      shared: true,
      pointFormat: "{series.name}: <b>{point.y}</b><br/>",
    },
    plotOptions: {
      column: {
        stacking: "normal",
      },
    },
    series,
    credits: {
      enabled: false,
    },
  };
});

const languageOptions = computed<Options>(() => {
  const isMobile = isMobileLayout.value;
  const counts = new Map<string, number>();
  for (const submission of props.submissions) {
    const language = submission.language?.trim();
    if (language) {
      counts.set(language, (counts.get(language) ?? 0) + 1);
    }
  }

  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);

  return {
    chart: {
      type: "bar",
      backgroundColor: "transparent",
      height: isMobile
        ? Math.min(320, Math.max(200, entries.length * 28 + 80))
        : Math.max(240, entries.length * 36 + 100),
    },
    title: {
      text: t("submission_statistics.language_title"),
      ...(isMobile ? { style: { fontSize: "14px" } } : {}),
    },
    xAxis: {
      categories: entries.map(([language]) => language),
      ...(isMobile
        ? {
            labels: {
              style: {
                fontSize: "9px",
              },
            },
          }
        : {}),
    },
    yAxis: {
      min: 0,
      title: {
        text: t("submission_statistics.submissions"),
        ...(isMobile ? { style: { fontSize: "11px" } } : {}),
      },
    },
    series: [
      {
        name: t("submission_statistics.submissions"),
        data: entries.map(([, count]) => count),
        color: "#60a5fa",
        showInLegend: false,
      },
    ],
    credits: {
      enabled: false,
    },
  };
});
</script>

<template>
  <div class="flex w-full flex-col gap-6">
    <div v-if="submissions.length === 0" class="py-12 text-center text-gray-500 dark:text-gray-400">
      {{ t("submission_statistics.no_submissions") }}
    </div>

    <template v-else>
      <Chart :options="verdictOptions" />
      <Chart :options="timeOptions" />
      <Chart :options="languageOptions" />
    </template>
  </div>
</template>
