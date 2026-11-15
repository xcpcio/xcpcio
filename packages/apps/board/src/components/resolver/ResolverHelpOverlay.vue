<script setup lang="ts">
defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div
    v-if="visible"
    class="fixed inset-0 z-[1100] flex items-center justify-center bg-black/70 font-mono"
    @click.self="emit('close')"
  >
    <div class="mx-4 min-w-[28rem] max-w-[90vw] rounded-lg bg-[#1b1d24] px-8 py-6 text-sm text-gray-200 shadow-xl">
      <div class="mb-4 text-lg font-bold">
        Resolver Hotkeys
      </div>

      <div class="grid grid-cols-[auto_1fr] items-baseline gap-x-6 gap-y-2">
        <span class="text-gray-400">n / Space</span>
        <span>Next submission / start the initial scroll</span>

        <span class="text-gray-400">r</span>
        <span>Rewind the previous submission</span>

        <span class="text-gray-400">l</span>
        <span>Toggle less mode</span>

        <span class="text-gray-400">q / Esc</span>
        <span>Exit less mode (or close this help)</span>

        <span class="text-gray-400">e / y</span>
        <span>One row up / down</span>

        <span class="text-gray-400">d / u</span>
        <span>Half screen up / down</span>

        <span class="text-gray-400">f / b</span>
        <span>One screen up / down</span>

        <span class="text-gray-400">g / G</span>
        <span>Go to top / bottom</span>

        <span class="text-gray-400">h / ?</span>
        <span>Toggle this help</span>
      </div>

      <div class="mt-4 text-xs text-gray-500">
        Navigation keys (e/y, d/u, f/b, g/G) require less mode.
        <br>
        up = forward (apply/skip submissions) · down = back (undo)
      </div>
    </div>
  </div>
</template>
