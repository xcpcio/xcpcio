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

    <template v-if="rank.contest.socialMedia">
      <div
        class="border-l-[1px] border-r-[1px]"
        mx-2
        h-6
        border-color-black
        dark:border-color-white
      />

      <div flex gap-2>
        <a
          v-if="rank.contest.socialMedia?.bilibili"
          icon-btn
          :href="rank.contest.socialMedia.bilibili"
          target="_blank"
          rel="noopener noreferrer"
          title="Watch on Bilibili"
        >
          <div i-simple-icons-bilibili text-lg />
        </a>

        <a
          v-if="rank.contest.socialMedia?.youtube"
          icon-btn
          :href="rank.contest.socialMedia.youtube"
          target="_blank"
          rel="noopener noreferrer"
          title="Watch on YouTube"
        >
          <div i-simple-icons-youtube text-lg />
        </a>
      </div>
    </template>

    <div
      class="border-l-[1px] border-r-[1px]"
      mx-2
      h-6
      border-color-black
      dark:border-color-white
    />

    <div flex>
      <div
        ref="dropdownTriggerEl"
        i-material-symbols-share
        text-lg
        cursor-pointer
      />

      <div
        ref="dropdownTargetEl"
        class="z-9999 hidden rounded-lg shadow-lg border border-gray-200 dark:border-gray-600"
        bg-white
        dark:bg-gray-800
      >
        <ul
          class="py-1 text-sm text-gray-700 dark:text-gray-200"
        >
          <li>
            <div
              class="flex items-center gap-2 px-4 py-2.5 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-gray-700 dark:hover:text-teal-400 transition-colors duration-150"
              cursor-pointer
              @click="copyLink"
            >
              <div i-material-symbols-link text-base />
              <span>Copy Link</span>
            </div>
          </li>
          <li>
            <div
              class="flex items-center gap-2 px-4 py-2.5 hover:bg-teal-50 hover:text-teal-700 dark:hover:bg-gray-700 dark:hover:text-teal-400 transition-colors duration-150"
              cursor-pointer
              @click="copyCode"
            >
              <div i-material-symbols-code text-base />
              <span>Copy Embed Code</span>
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
