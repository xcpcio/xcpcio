<script setup lang="ts">
import { Tooltip } from "flowbite";
import type { TooltipInterface, TooltipOptions } from "flowbite";

const props = defineProps<{
  placement?: "left" | "right" | "top" | "bottom",
}>();

const tooltipTargetEl = ref(null);
const tooltipTriggerEl = ref(null);

// eslint-disable-next-line unused-imports/no-unused-vars
let tooltip: TooltipInterface | null = null;

const placement = computed(() => {
  return props.placement ?? "top";
});

onMounted(() => {
  if (tooltipTargetEl.value && tooltipTriggerEl.value) {
    const options: TooltipOptions = {
      placement: placement.value as unknown as undefined,
      triggerType: "hover",
    };

    tooltip = new Tooltip(tooltipTargetEl.value, tooltipTriggerEl.value, options);
  }
});
</script>

<template>
  <div>
    <div
      ref="tooltipTriggerEl"
    >
      <slot />
    </div>

    <div
      ref="tooltipTargetEl"
      role="tooltip"
      class="tooltip inline-block absolute invisible px-3 py-2 transition-opacity duration-300 shadow-sm opacity-0"
      z-9999
      rounded
      text-base text-white font-medium
      bg-gray-900 dark:bg-gray-700
    >
      <div>
        <slot
          name="popper"
        />
      </div>

      <div
        class="tooltip-arrow"
        data-popper-arrow
      />
    </div>
  </div>
</template>
