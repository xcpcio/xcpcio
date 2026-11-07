<script setup lang="ts">
import type { Rank, SeatMap, SeatMapSection, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
  seatMap: SeatMap;
  filteredTeamIds: Set<string>;
  allTeams: Team[];
}>();

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

// === Seat Sizing ===
const SEAT_HEIGHT = 24;
const GAP_SIZE = 4;
const FONT_SIZE = 10;
const SEAT_PADDING = 8;

// Calculate max seat ID length in a section
function getMaxSeatIdLength(section: SeatMapSection): number {
  let maxLen = 2; // minimum 2 characters
  for (const row of section.grid) {
    for (const seatId of row) {
      if (seatId && seatId.length > maxLen) {
        maxLen = seatId.length;
      }
    }
  }
  return maxLen;
}

// Calculate seat width based on max seat ID length
function getSeatWidth(section: SeatMapSection): number {
  const maxLen = getMaxSeatIdLength(section);
  const charWidth = FONT_SIZE * 0.6;
  return Math.round(maxLen * charWidth + SEAT_PADDING);
}

// Get max columns in the grid
function getMaxCols(section: SeatMapSection): number {
  if (section.grid.length === 0) {
    return 0;
  }
  return Math.max(...section.grid.map(row => row.length));
}

interface SeatCell {
  seatId: string;
  colIdx: number;
}

interface SeatRow {
  rowIdx: number;
  seats: SeatCell[];
}

interface SectionLayout {
  section: SeatMapSection;
  maxCols: number;
  seatWidth: number;
  rows: SeatRow[];
}

// Precompute the layout once per seat map instead of per cell. Empty cells are not
// rendered at all; their grid tracks are still reserved by gridTemplateRows/Columns.
const sectionLayouts = computed<SectionLayout[]>(() => props.seatMap.sections.map((section) => {
  const maxCols = getMaxCols(section);

  return {
    section,
    maxCols,
    seatWidth: getSeatWidth(section),
    rows: section.grid.map((row, rowIdx) => ({
      rowIdx,
      seats: row
        .map((seatId, colIdx) => (seatId ? { seatId, colIdx } : null))
        .filter((seat): seat is SeatCell => seat !== null),
    })),
  };
}));

// Build seat ID to team mapping
const seatToTeam = computed(() => {
  return props.seatMap.buildSeatToTeamMap(props.allTeams);
});

// One shared hover tooltip instead of a floating-vue Tooltip per seat.
const hoveredSeat = ref<{ text: string; x: number; y: number } | null>(null);

function getTooltipContent(seatId: string): string {
  const team = seatToTeam.value.get(seatId);
  if (!team) {
    return seatId;
  }

  const name = team.name.getOrDefault(lang.value);
  const org = team.organization?.name.getOrDefault(lang.value);
  return org ? `${name} - ${org}` : name;
}

function onSeatEnter(seatId: string, event: MouseEvent) {
  hoveredSeat.value = {
    text: getTooltipContent(seatId),
    x: event.clientX,
    y: event.clientY,
  };
}

function onSeatLeave() {
  hoveredSeat.value = null;
}

function seatClass(seatId: string): Record<string, boolean> {
  const team = seatToTeam.value.get(seatId);
  const hasFilter = props.filteredTeamIds.size > 0;
  const highlighted = !!team && (!hasFilter || props.filteredTeamIds.has(team.id));

  return {
    "seat-occupied": !!team,
    "seat-highlighted": highlighted,
    "seat-dimmed": hasFilter && !!team && !highlighted,
  };
}

function getSectionGridStyle(layout: SectionLayout) {
  const rows = layout.section.grid.length;

  return {
    display: "grid",
    gridTemplateColumns: layout.maxCols > 0 ? `repeat(${layout.maxCols}, ${layout.seatWidth}px)` : undefined,
    gridTemplateRows: rows > 0 ? `repeat(${rows}, ${SEAT_HEIGHT}px)` : undefined,
    gap: `${GAP_SIZE}px`,
  };
}

function getSeatStyle(rowIdx: number, colIdx: number) {
  return {
    gridRow: `${rowIdx + 1}`,
    gridColumn: `${colIdx + 1}`,
  };
}

function getRowLabelStyle() {
  return {
    height: `${SEAT_HEIGHT}px`,
    marginBottom: `${GAP_SIZE}px`,
  };
}
</script>

<template>
  <div class="seat-map-container" flex="~ col items-center">
    <div
      v-for="(layout, sectionIdx) in sectionLayouts"
      :key="sectionIdx"
      class="seat-map-section"
      mb-8
    >
      <h3
        v-if="layout.section.title.getOrDefault(lang)"
        text="lg center gray-700 dark:gray-300"
        font="semibold"
        mb-4
      >
        {{ layout.section.title.getOrDefault(lang) }}
      </h3>

      <div
        class="seat-grid-wrapper dark:bg-gray-800/40 dark:border-gray-700/50"
        flex="~ justify-center"
        bg-white
        rounded-xl
        p-4
        border
        border-gray-200
      >
        <!-- Row labels -->
        <div
          v-if="layout.section.rowLabels.length > 0"
          class="row-labels"
          flex="~ col"
          mr-3
        >
          <div
            v-for="(label, rowIdx) in layout.section.rowLabels"
            :key="rowIdx"
            :style="getRowLabelStyle()"
            flex="~ items-center justify-center"
            text="xs gray-400 dark:gray-500"
            font-medium
            w-6
          >
            {{ label ?? "" }}
          </div>
        </div>

        <!-- Seat grid: only non-empty seats are rendered, placed explicitly -->
        <div :style="getSectionGridStyle(layout)">
          <template v-for="row in layout.rows" :key="row.rowIdx">
            <div
              v-for="seat in row.seats"
              :key="seat.seatId"
              class="seat"
              :class="seatClass(seat.seatId)"
              :style="getSeatStyle(row.rowIdx, seat.colIdx)"
              flex="~ items-center justify-center"
              rounded="sm"
              font="mono"
              cursor-pointer
              @mouseenter="onSeatEnter(seat.seatId, $event)"
              @mouseleave="onSeatLeave"
            >
              {{ seat.seatId }}
            </div>
          </template>
        </div>
      </div>
    </div>

    <div
      v-if="hoveredSeat"
      class="seat-tooltip"
      :style="{ left: `${hoveredSeat.x + 12}px`, top: `${hoveredSeat.y + 12}px` }"
    >
      {{ hoveredSeat.text }}
    </div>
  </div>
</template>

<style scoped>
/* Empty seat - flat gray */
.seat {
  font-size: 10px;
  background-color: #f3f4f6;
  border: 1px solid #d1d5db;
  transition: all 0.2s ease;
}

.seat:hover {
  background-color: #e5e7eb;
  border-color: #9ca3af;
}

/* Occupied seat - flat blue */
.seat-occupied {
  background-color: #bfdbfe;
  border-color: #60a5fa;
  color: #1e40af;
}

.seat-occupied:hover {
  background-color: #93c5fd;
}

/* Highlighted seat - deep blue + slight scale */
.seat-highlighted {
  background-color: #3b82f6;
  border-color: #2563eb;
  color: white;
  transform: scale(1.05);
  z-index: 1;
}

/* Dimmed state */
.seat-dimmed {
  opacity: 0.35;
}

.seat-tooltip {
  position: fixed;
  z-index: 60;
  max-width: 360px;
  padding: 4px 8px;
  border-radius: 6px;
  background-color: rgb(17 24 39 / 0.9);
  color: white;
  font-size: 12px;
  line-height: 1.4;
  pointer-events: none;
}

/* === Dark Mode === */
.dark .seat {
  background-color: #374151;
  border-color: #4b5563;
}

.dark .seat:hover {
  background-color: #4b5563;
}

.dark .seat-occupied {
  background-color: #1e3a5f;
  border-color: #3b82f6;
  color: #93c5fd;
}

.dark .seat-occupied:hover {
  background-color: #1e4a7f;
}

/* Dark mode highlight - blue glow effect */
.dark .seat-highlighted {
  background-color: #3b82f6;
  border-color: #60a5fa;
  color: white;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.5);
}

.dark .seat-tooltip {
  background-color: rgb(229 231 235 / 0.95);
  color: #111827;
}
</style>
