<script setup lang="ts">
import type { TooltipInterface, TooltipOptions } from "flowbite";
import { Tooltip } from "flowbite";
import "./Tooltip.css";

const props = defineProps<{
  placement?: "left" | "right" | "top" | "bottom" | "auto";
}>();

const instanceId = `vue-tooltip-${getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)}`;
const tooltipTargetEl = ref<HTMLElement | null>(null);
const tooltipTriggerEl = ref<HTMLElement | null>(null);
const isTriggerVisible = useElementVisibility(tooltipTriggerEl);
const placement = computed(() => {
  return props.placement ?? "auto";
});

let tooltip: TooltipInterface | null = null;
let cleanup: (() => void) | null = null;

function createTooltip() {
  if (tooltip) {
    return;
  }

  if (!tooltipTargetEl.value || !tooltipTriggerEl.value) {
    return;
  }

  const options: TooltipOptions = {
    placement: placement.value as unknown as undefined,
    triggerType: "none",
  };

  tooltip = new Tooltip(tooltipTargetEl.value, tooltipTriggerEl.value, options, {
    id: instanceId,
    override: true,
  });
}

function destroyTooltip() {
  tooltip?.destroyAndRemoveInstance();
  tooltip = null;
}

function showTooltip() {
  createTooltip();
  tooltip?.show();
}

function hideTooltip() {
  tooltip?.hide();
}

watch(isTriggerVisible, (visible) => {
  if (visible) {
    return;
  }

  if (!tooltip) {
    return;
  }

  tooltip.hide();
  destroyTooltip();
});

onMounted(() => {
  const triggerEl = tooltipTriggerEl.value;
  if (!triggerEl) {
    return;
  }

  const onMouseEnter = () => showTooltip();
  const onMouseLeave = () => hideTooltip();
  const onFocus = () => showTooltip();
  const onBlur = () => hideTooltip();

  triggerEl.addEventListener("mouseenter", onMouseEnter);
  triggerEl.addEventListener("mouseleave", onMouseLeave);
  triggerEl.addEventListener("focus", onFocus, true);
  triggerEl.addEventListener("blur", onBlur, true);

  cleanup = () => {
    triggerEl.removeEventListener("mouseenter", onMouseEnter);
    triggerEl.removeEventListener("mouseleave", onMouseLeave);
    triggerEl.removeEventListener("focus", onFocus, true);
    triggerEl.removeEventListener("blur", onBlur, true);
  };
});

onBeforeUnmount(() => {
  cleanup?.();
  cleanup = null;
  destroyTooltip();
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
      z-99999
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
