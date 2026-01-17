<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

import type { DropdownOptions } from "flowbite";
import { Dropdown } from "flowbite";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  rank: Rank;
}>();

const rank = computed(() => props.rank);

const $toast = useToast();
const { copy, isSupported } = useClipboard();

const isHiddenInfoModal = ref(true);

function openInfoModal() {
  isHiddenInfoModal.value = false;
}

let dropdown: Dropdown | null = null;
const dropdownTargetEl = ref(null);
const dropdownTriggerEl = ref(null);

function preCheck() {
  if (!window) {
    return false;
  }

  if (!isSupported.value) {
    $toast.warning("clipboard is not supported");
    dropdown?.hide();
    return false;
  }

  return true;
}

function postCall() {
  $toast.success("copy success");
  dropdown?.hide();
}

function copyLink() {
  if (!preCheck()) {
    return;
  }

  copy(window.location.href);
  postCall();
}

function copyCode() {
  if (!preCheck()) {
    return;
  }

  const code = `<iframe src="${window.location.href}" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 720px"></iframe>`;
  copy(code);
  postCall();
}

onMounted(() => {
  {
    if (dropdownTargetEl.value && dropdownTriggerEl.value) {
      const options: DropdownOptions = {
        placement: "right",
        triggerType: "click",
        offsetSkidding: 32,
        offsetDistance: 5,
        delay: 300,
      };

      dropdown = new Dropdown(dropdownTargetEl.value, dropdownTriggerEl.value, options);
    }
  }
});
</script>

<template>
  <div
    flex
  >
    <div>
      <div
        i-material-symbols-info-outline
        text-lg
        cursor-pointer
        @click="openInfoModal"
      />
    </div>

    <div
      class="border-l-[1px] border-r-[1px]"
      mx-2
      h-6
      border-color-black
      dark:border-color-white
    />

    <div
      flex
    >
      <div
        ref="dropdownTriggerEl"
        i-material-symbols-share
        text-lg
        cursor-pointer
      />

      <div
        ref="dropdownTargetEl"
        class="z-9999 hidden divide-y divide-gray-100 rounded shadow w-36"
        bg-white
        dark:bg-gray-700
      >
        <ul
          class="py-2 text-sm text-gray-700 dark:text-gray-200"
        >
          <li>
            <div
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              cursor-pointer
              @click="copyLink"
            >
              Copy Page Link
            </div>
          </li>
          <li>
            <div
              class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
              cursor-pointer
              @click="copyCode"
            >
              Copy Page Code
            </div>
          </li>
        </ul>
      </div>
    </div>

    <InfoModal
      v-if="!isHiddenInfoModal"
      v-model:is-hidden="isHiddenInfoModal"
      :rank="rank"
    />
  </div>
</template>
