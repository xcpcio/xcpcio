import type { Contest, Submissions, Teams } from "@xcpcio/types";
import { useQuery } from "@tanstack/vue-query";

export interface BoardData {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;
}

async function fetch_board_data(target: string): Promise<BoardData> {
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

  const res = options.allInOne
    ? [await fetch(prefix)]
    : [
        await fetch(`${prefix}/config.json`),
        await fetch(`${prefix}/team.json`),
        await fetch(`${prefix}/run.json`),
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

export function useQueryBoardData(target: string, queryOnce = false) {
  const retry = 3;
  const staleTime = 30_000;
  let refetchInterval: number | false = window.REFETCH_INTERVAL;

  if (queryOnce) {
    refetchInterval = false;
  }

  return useQuery({
    queryKey: [target],
    queryFn: () => fetch_board_data(target),
    retry,
    staleTime,
    refetchInterval,
  });
}
