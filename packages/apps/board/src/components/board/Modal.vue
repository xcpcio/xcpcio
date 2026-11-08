<script setup lang="ts">
import { useModalStack } from "@board/composables/useModalStack";
import { useMagicKeys } from "@vueuse/core";

export type ModalCloseReason = "esc" | "outside" | "close-button";

const props = defineProps<{
  isHidden: boolean;

  title?: string;
  width?: string;
  mt?: string;

  /**
   * Whether the modal body is a scroll container.
   * Disabling it lets popups (e.g. dropdown menus) extend past the
   * modal border; the body still scrolls when its content overflows.
   */
  scrollable?: boolean;
}>();

const emit = defineEmits(["update:isHidden", "onBeforeClose"]);

const { register, unregister, isTopModal } = useModalStack();

onMounted(() => register());
onUnmounted(() => unregister());

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const bodyRef = ref<HTMLElement | null>(null);
const hasOverflowingContent = ref(true);

const isBodyScrollable = computed(() => (props.scrollable ?? true) || hasOverflowingContent.value);

let bodyResizeObserver: ResizeObserver | undefined;
let bodyMutationObserver: MutationObserver | undefined;

function updateHasOverflowingContent() {
  const body = bodyRef.value;
  if (!body) {
    return;
  }

  // An open dropdown renders an absolutely positioned menu whose height counts
  // towards scrollHeight, so only measure while no dropdown menu is open.
  if (body.querySelector(".ui.dropdown.active")) {
    return;
  }

  hasOverflowingContent.value = body.scrollHeight - body.clientHeight > 1;
}

onMounted(async () => {
  if (props.scrollable !== false) {
    return;
  }

  await nextTick();
  updateHasOverflowingContent();

  if (!bodyRef.value) {
    return;
  }

  bodyResizeObserver = new ResizeObserver(updateHasOverflowingContent);
  bodyResizeObserver.observe(bodyRef.value);

  bodyMutationObserver = new MutationObserver(updateHasOverflowingContent);
  bodyMutationObserver.observe(bodyRef.value, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
  });
});

onUnmounted(() => {
  bodyResizeObserver?.disconnect();
  bodyMutationObserver?.disconnect();
});

function onClose(reason: ModalCloseReason = "outside") {
  emit("onBeforeClose", reason);
  isHidden.value = true;
}

const { Escape } = useMagicKeys();
watch(Escape, (v) => {
  if (v && isTopModal()) {
    onClose("esc");
  }
});
</script>

<template>
  <div
    class="md:inset-0 w-[100%] h-[100%]"
    :class="[props.mt ?? 'md:mt-32 sm:mt-16']"
    fixed z-1997
    of-x-hidden
    flex justify-center items-start
  >
    <!-- background -->
    <div
      class="w-[100%] h-[100%]"
      fixed left-0 top-0 z-1998
      :style="{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }"
      @click="onClose('outside')"
    />

    <div
      class="relative p-4"
      :class="[props.width ?? 'w-[78%]']"
      z-1999
    >
      <div
        class="relative bg-white dark:bg-gray-800 sm:p-4 max-h-[calc(100vh-5rem)] flex flex-col"
        rounded-sm shadow-sm
      >
        <div
          class="mb-4 border-b rounded-t pb-4 sm:mb-4 dark:border-gray-600 shrink-0"
          flex items-center justify-between
        >
          <slot name="header">
            <h3
              text-gray-900 dark:text-white
              text-xl
              font-sans font-semibold italic
            >
              {{ props.title }}
            </h3>
          </slot>

          <button
            type="button"
            class="hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            bg-transparent
            ml-auto p-1.5
            text-sm text-gray-400
            items-center inline-flex rounded-lg
            @click="onClose('close-button')"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              sr-only
            >
              Close modal
            </span>
          </button>
        </div>
        <div
          ref="bodyRef"
          class="min-h-0 flex-1"
          :class="isBodyScrollable ? 'overflow-y-auto' : 'overflow-visible'"
        >
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>
