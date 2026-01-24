import type { Contest, Submissions, Teams } from "@xcpcio/types";
import { useQuery } from "@tanstack/vue-query";

export interface BoardData {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;
}

function isDataItem(obj: unknown): obj is { url: string } {
  return obj !== null && typeof obj === "object" && "url" in obj;
}

async function fetchAndAssignOrganizations(contest: Contest, baseUrl: string): Promise<void> {
  if (!contest?.organizations || !isDataItem(contest.organizations)) {
    return;
  }

  const { url } = contest.organizations;
  let fetchUrl = url;
  if (!url.startsWith("http")) {
    fetchUrl = `${baseUrl}/${url}`;
  }

  const orgRes = await fetch(fetchUrl);
  if (orgRes.ok) {
    contest.organizations = await orgRes.json();
  }
}

async function fetchAndAssignSeatMap(contest: Contest, baseUrl: string): Promise<void> {
  if (!contest?.seat_map || !isDataItem(contest.seat_map)) {
    return;
  }

  const { url } = contest.seat_map;
  let fetchUrl = url;
  if (!url.startsWith("http")) {
    fetchUrl = `${baseUrl}/${url}`;
  }

  const seatMapRes = await fetch(fetchUrl);
  if (seatMapRes.ok) {
    contest.seat_map = await seatMapRes.json();
  }
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
  if (status >= 400 || status < 200) {
    throw new Error(`fetch data failed. [status=${status}] [statusText=${statusText}]`);
  }

  const jsonData = await Promise.all(res.map(r => r.json()));
  if (options.allInOne) {
    return jsonData[0];
  }

  const contest = jsonData[0];
  await fetchAndAssignOrganizations(contest, prefix);
  await fetchAndAssignSeatMap(contest, prefix);

  return {
    contest,
    teams: jsonData[1],
    submissions: jsonData[2],
  };
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
