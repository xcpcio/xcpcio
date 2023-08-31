import { useQuery } from "@tanstack/vue-query";
import type { Contest, Submissions, Teams } from "@xcpcio/types";

export interface BoardData {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;
}

async function fetcher(target: string, timestamp?: number): Promise<BoardData> {
  const endpoint = target.startsWith("/") ? target.slice(1) : target;
  const prefix = `${window.DATA_HOST}${endpoint}`;

  const contestResp = await fetch(`${prefix}/config.json?t=${timestamp ?? 0}`);
  const teamsResp = await fetch(`${prefix}/team.json?t=${timestamp ?? 0}`);
  const submissionsResp = await fetch(`${prefix}/run.json?t=${timestamp ?? 0}`);

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

export function useQueryBoardData(target: string, timestamp?: number) {
  return useQuery({
    queryKey: [target, timestamp],
    queryFn: () => fetcher(target, timestamp),
    retry: 3,
  });
}
