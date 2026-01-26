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

// Build seat ID to team mapping
const seatToTeam = computed(() => {
  return props.seatMap.buildSeatToTeamMap(props.allTeams);
});

// Get team for a given seat
function getTeamForSeat(seatId: string | null): Team | undefined {
  if (!seatId) {
    return undefined;
  }
  return seatToTeam.value.get(seatId);
}

// Get tooltip content for a seat
function getTooltipContent(seatId: string): string {
  const team = getTeamForSeat(seatId);
  if (!team) {
    return seatId;
  }

  const name = team.name.getOrDefault(lang.value);
  const org = team.organization?.name.getOrDefault(lang.value);
  return org ? `${name} - ${org}` : name;
}

// Check if a seat's team should be highlighted
function isSeatHighlighted(seatId: string | null): boolean {
  const team = getTeamForSeat(seatId);
  if (!team) {
    return false;
  }
  return props.filteredTeamIds.size === 0 || props.filteredTeamIds.has(team.id);
}

// Get max columns in the grid
function getMaxCols(section: SeatMapSection): number {
  if (section.grid.length === 0) {
    return 0;
  }
  return Math.max(...section.grid.map(row => row.length));
}

// Normalize row to have consistent column count
function getNormalizedRow(row: Array<string | null>, maxCols: number): Array<string | null> {
  if (row.length >= maxCols) {
    return row;
  }
  return [...row, ...Array.from({ length: maxCols - row.length }, () => null)];
}

// Get grid style for a section
function getSectionGridStyle(section: SeatMapSection) {
  const cols = getMaxCols(section);
  const width = getSeatWidth(section);
  return {
    display: "grid",
    gridTemplateColumns: `repeat(${cols}, ${width}px)`,
    gap: `${GAP_SIZE}px`,
  };
}

function getSeatStyle(section: SeatMapSection) {
  return {
    width: `${getSeatWidth(section)}px`,
    height: `${SEAT_HEIGHT}px`,
    fontSize: `${FONT_SIZE}px`,
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
      v-for="(section, sectionIdx) in seatMap.sections"
      :key="sectionIdx"
      class="seat-map-section"
      mb-8
    >
      <h3
        v-if="section.title.getOrDefault(lang)"
        text="lg center gray-700 dark:gray-300"
        font="semibold"
        mb-4
      >
        {{ section.title.getOrDefault(lang) }}
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
          v-if="section.rowLabels.length > 0"
          class="row-labels"
          flex="~ col"
          mr-3
        >
          <div
            v-for="(label, rowIdx) in section.rowLabels"
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

        <!-- Seat grid -->
        <div :style="getSectionGridStyle(section)">
          <template v-for="(row, rowIdx) in section.grid" :key="rowIdx">
            <template v-for="(seatId, colIdx) in getNormalizedRow(row, getMaxCols(section))" :key="`${rowIdx}-${colIdx}`">
              <Tooltip v-if="seatId" placement="bottom">
                <div
                  class="seat"
                  :class="{
                    'seat-occupied': getTeamForSeat(seatId),
                    'seat-highlighted': isSeatHighlighted(seatId),
                    'seat-dimmed': filteredTeamIds.size > 0 && !isSeatHighlighted(seatId) && getTeamForSeat(seatId),
                  }"
                  :style="getSeatStyle(section)"
                  flex="~ items-center justify-center"
                  rounded="sm"
                  font="mono"
                  cursor-pointer
                >
                  {{ seatId }}
                </div>
                <template #popper>
                  {{ getTooltipContent(seatId) }}
                </template>
              </Tooltip>
              <div
                v-else
                :style="getSeatStyle(section)"
              />
            </template>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Empty seat - flat gray */
.seat {
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
</style>
