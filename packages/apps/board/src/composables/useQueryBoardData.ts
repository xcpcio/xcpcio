import { useQuery } from "@tanstack/vue-query";
import type { Contest, Submissions, Teams } from "@xcpcio/types";

const RETRY = 3;
const REFETCH_INTERVAL = 30 * 1000;

export interface BoardData {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;
}

async function fetcher(target: string, timestamp?: number): Promise<BoardData> {
  const endpoint = target.startsWith("/") ? target.slice(1) : target;
  let prefix = `${window.DATA_HOST}${endpoint}`;

  if (target.startsWith("http")) {
    prefix = target;
  }

  if (prefix.endsWith("/")) {
    prefix = prefix.slice(0, -1);
  }

  const contestResp = await fetch(`${prefix}/config.json?t=${timestamp ?? 0}`);
  const teamsResp = await fetch(`${prefix}/team.json?t=${timestamp ?? 0}`);
  const submissionsResp = await fetch(`${prefix}/run.json?t=${timestamp ?? 0}`);

  const { status, statusText } = contestResp;
  if (status >= 300 || status < 200) {
    throw new Error(`fetch data failed. [status=${status}] [statusText=${statusText}]`);
  }

  const p = Promise.all([
    contestResp.json(),
    teamsResp.json(),
    submissionsResp.json()]).then((res) => {
    return {
      contest: res[0],
      teams: res[1],
      submissions: res[2],
    };
  });

  return p;
}

export function useQueryBoardData(target: string, timestamp?: any) {
  return useQuery({
    queryKey: [target, timestamp.value.getTime()],
    queryFn: () => fetcher(target, timestamp.value.getTime()),
    retry: RETRY,
    staleTime: REFETCH_INTERVAL,
    refetchInterval: REFETCH_INTERVAL,
  });
}
