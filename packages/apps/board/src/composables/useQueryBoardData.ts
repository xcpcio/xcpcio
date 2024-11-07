import type { Contest, Submissions, Teams } from "@xcpcio/types";
import { useQuery } from "@tanstack/vue-query";
import { DATA_REGION } from "./constant";

const RETRY = 3;

export interface BoardData {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;
}

async function fetcher(target: string, timestamp?: number): Promise<BoardData> {
  const endpoint = target.startsWith("/") ? target.slice(1) : target;
  let prefix = `${window.DATA_HOST}${endpoint}`;
  const options = {
    allInOne: false,
  };
  if (prefix.includes("#")) {
    const params = new URLSearchParams(prefix.split("#")[1]);
    options.allInOne = params.get("allInOne") === "true";
    prefix = prefix.split("#")[0];
  }

  if (target.startsWith("http")) {
    prefix = target;
  }

  if (prefix.endsWith("/")) {
    prefix = prefix.slice(0, -1);
  }

  const addTimestamp = (url: string) => {
    return url.includes("?") ? `${url}&t=${timestamp ?? 0}` : `${url}?t=${timestamp ?? 0}`;
  };

  const res = options.allInOne
    ? [await fetch(addTimestamp(prefix))]
    : [
        await fetch(addTimestamp(`${prefix}/config.json`)),
        await fetch(addTimestamp(`${prefix}/team.json`)),
        await fetch(addTimestamp(`${prefix}/run.json`)),
      ];

  const { status, statusText } = res[0];
  if (status >= 300 || status < 200) {
    throw new Error(`fetch data failed. [status=${status}] [statusText=${statusText}]`);
  }

  const p = Promise.all(res.map(r => r.json())).then((res) => {
    return options.allInOne
      ? res[0]
      : {
          contest: res[0],
          teams: res[1],
          submissions: res[2],
        };
  });

  return p;
}

export function useQueryBoardData(target: string, timestamp?: any, queryOnce = false) {
  let staleTime = 30 * 1000;
  let refetchInterval: number | false = staleTime;
  const timestampSeconds = computed(() => Math.floor(timestamp.value.getTime() / 1000 / 10));

  if (DATA_REGION.value === "I18N") {
    staleTime = 10 * 1000;
    refetchInterval = staleTime;
  }

  if (queryOnce) {
    staleTime = Number.POSITIVE_INFINITY;
    refetchInterval = false;
  }

  return useQuery({
    queryKey: [target, timestampSeconds.value],
    queryFn: () => fetcher(target, timestampSeconds.value),
    retry: RETRY,
    staleTime,
    refetchInterval,
  });
}
