<script setup lang="ts">
import type { Organization, Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  isHidden: boolean;

  rank: Rank;
  organization: Organization;
}>();
const emit = defineEmits(["update:isHidden"]);

const TYPE_OVERVIEW = "overview";
const TYPE_TEAMS = "teams";

const types = [TYPE_OVERVIEW, TYPE_TEAMS];

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const currentType = ref(TYPE_OVERVIEW);

const rank = computed(() => props.rank);
const organization = computed(() => props.organization);

const headerTitle = computed(() => {
  return organization.value.name.getOrDefault(lang.value);
});
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
  >
    <template #header>
      <div
        w-full max-w-screen-xl
        px-4 lg:px-12
        mx-auto
      >
        <div
          relative overflow-hidden
          bg-white dark:bg-gray-800
        >
          <div
            flex flex-col items-center justify-between
            md:flex-row
            space-y-3 md:space-y-0
          >
            <div
              flex flex-row items-center justify-center
              space-x-4
            >
              <Badge
                v-if="organization.logo"
                :image="organization.logo"
                width-class="h-16 w-16"
              />

              <Tooltip>
                <h3
                  text-gray-900 dark:text-white
                  text-2xl
                  font-sans font-semibold italic
                >
                  {{ headerTitle }}
                </h3>

                <template #popper>
                  <div
                    flex flex-col
                    justify-start items-start
                  >
                    <div>
                      Org ID: {{ organization.id }}
                    </div>
                    <div v-if="organization.icpcID && organization.icpcID.length > 0">
                      ICPC ID: {{ organization.icpcID }}
                    </div>
                  </div>
                </template>
              </Tooltip>
            </div>

            <ModalMenu
              v-model:current-type="currentType"
              :types="types"
            />
          </div>
        </div>
      </div>
    </template>

    <div
      w-full
      font-bold font-mono
      flex items-center justify-center
    >
      <div
        v-if="currentType === TYPE_OVERVIEW"
        w-full
      >
        <OrgOverview
          :rank="rank"
          :organization="organization"
        />
      </div>

      <div
        v-if="currentType === TYPE_TEAMS"
        w-full
      >
        <OrgBoard
          w-full
          :rank="rank"
          :organization-id="organization.id"
        />
      </div>
    </div>
  </Modal>
</template>
