<script setup lang="ts">
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";
import { onKeyUp } from "@vueuse/core";
import { createContest, createSubmissions, createTeams, ResolverVue } from "@xcpcio/core";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

const props = defineProps<{
  dataSourceUrl: string;
}>();

gsap.registerPlugin(ScrollToPlugin);

const title = useTitle(RESOLVER_TITLE_SUFFIX);
const { t } = useI18n();

const firstLoaded = ref(false);
const startFirstScroll = ref(false);
const finishedFirstScroll = ref(false);
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
  if (!finishedFirstScroll.value) {
    startFirstScroll.value = true;
    return;
  }

  resolver.value.next();
}, { dedupe: true });

onKeyUp(["r"], () => {
  resolver.value.rewind();
}, { dedupe: true });

onKeyUp(["w"], () => {
  resolver.value.currentIndex--;
});

onKeyUp(["s"], () => {
  resolver.value.currentIndex++;
});

const resolverRef = ref<HTMLElement | null>(null);
const currentRowRef = ref<HTMLElement | null>(null);

onMounted(() => {
  watch(() => startFirstScroll.value, async () => {
    if (finishedFirstScroll.value) {
      return;
    }

    if (!startFirstScroll.value) {
      return;
    }

    if (resolverRef.value) {
      const scrollHeight = resolverRef.value.scrollHeight;
      const clientHeight = resolverRef.value.clientHeight;

      gsap.to(resolverRef.value, {
        duration: Math.round(resolver.value.teams.length * 0.5),
        scrollTop: scrollHeight - clientHeight,
        ease: "power1.inOut",
        onComplete: () => {
          finishedFirstScroll.value = true;
        },
      });
    }
  }, { immediate: true });

  watch(() => resolver.value.currentIndex, async () => {
    if (!finishedFirstScroll.value) {
      return;
    }

    if (resolverRef.value && currentRowRef.value) {
      const containerRect = resolverRef.value.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const rowRect = currentRowRef.value.getBoundingClientRect();
      const rowHeight = rowRect.height;

      // 计算选中行应该在的位置（距离底部2行）
      const targetPosition = containerHeight - 3 * rowHeight;

      // 计算当前选中行相对于容器顶部的位置
      const currentPosition = rowRect.top - containerRect.top;

      // 计算需要滚动的距离
      const scrollDistance = (currentPosition - targetPosition);

      gsap.to(resolverRef.value, {
        duration: 2.5,
        ease: "power1.out",
        scrollTop: `+=${scrollDistance}`,
      });
    }
  }, { flush: "post" });
});
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
      <div>
        <div
          class="bg-resolver-bg-1"
          flex flex-col justify-between
          font-mono
          w-screen h-screen
          overflow-hidden
        >
          <div
            ref="resolverRef"
            h-full
            overflow-y-auto
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
                  :ref="(el) => { if (index === resolver.currentIndex) { currentRowRef = el as HTMLElement; } }"
                  :class="[team.id === resolver.currentTeamId ? 'z-999' : 'z-0']"
                  position-relative
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
