<script setup lang="ts">
import { onKeyUp } from "@vueuse/core";
import { ResolverVue, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";

const props = defineProps<{
  dataSourceUrl: string,
}>();

const title = useTitle(RESOLVER_TITLE_SUFFIX);
const { t } = useI18n();

const firstLoaded = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);
const resolver = ref({} as ResolverVue);
const now = useNow();

function reBuildResolver() {
  const newResolver = new ResolverVue(contest.value, teams.value, submissions.value);
  newResolver.buildResolver();
  resolver.value = newResolver;
}

const { data, isError, error } = useQueryBoardData(props.dataSourceUrl, now, /* queryOnce= */true);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contest.value = createContest(data.value?.contest as IContest);
  title.value = `${contest.value.name} | ${RESOLVER_TITLE_SUFFIX}`;

  teams.value = createTeams(data.value?.teams as ITeams);
  submissions.value = createSubmissions(data.value?.submissions as ISubmissions);

  reBuildResolver();

  firstLoaded.value = true;
}, { immediate: true });

onKeyStroke([" "], (e) => {
  e.preventDefault();
});

onKeyUp(["n", " "], () => {
  resolver.value.next();
}, { dedupe: true });

onKeyUp(["r"], () => {
  resolver.value.rewind();
}, { dedupe: true });
</script>

<template>
  <div

    text-gray-200
    w-screen h-screen
  >
    <div v-if="!firstLoaded">
      <div
        flex flex-col
        justify-center items-center
        w-screen h-screen
        text-xl italic
        class="bg-[#323443]"
      >
        <div>
          {{ t("common.loading") }}...
        </div>

        <div v-if="isError">
          {{ error }}
        </div>
      </div>
    </div>

    <div
      v-else
    >
      <div
        class="bg-resolver-bg-1"
        flex flex-col
        justify-between
        font-mono
      >
        <TransitionGroup
          name="resolver"
          tag="ul"
        >
          <template
            v-for="(team, index) in resolver.teams"
            :key="team.id"
          >
            <div
              position-relative
              :class="[team.id === resolver.currentTeamId ? 'z-999' : 'z-0']"
            >
              <ResolverTeamRow
                :index="index"
                :team="team"
                :resolver="resolver"
              />
            </div>
          </template>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resolver-move,
.resolver-enter-active,
.resolver-leave-active {
  transition: all 2s ease;
}

.resolver-enter-from,
.resolver-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.resolver-leave-active {
  position: absolute;
}
</style>
