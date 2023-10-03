import { SubmissionStatus } from "@xcpcio/types";

import type { Rank } from "./rank";

import {
  isAccepted,
  isNotCalculatedPenaltyStatus,
  isPending,
} from "./submission-status";

import dayjs from "./utils/dayjs";

function submissionStatusToCodeforcesGymDatStatus(status: SubmissionStatus): string {
  if (isAccepted(status)) {
    return "OK";
  }

  if (status === SubmissionStatus.WRONG_ANSWER) {
    return "WA";
  }

  if (status === SubmissionStatus.TIME_LIMIT_EXCEEDED) {
    return "TL";
  }

  if (status === SubmissionStatus.MEMORY_LIMIT_EXCEEDED) {
    return "ML";
  }

  if (status === SubmissionStatus.OUTPUT_LIMIT_EXCEEDED) {
    return "IL";
  }

  if (status === SubmissionStatus.PRESENTATION_ERROR) {
    return "PE";
  }

  if (status === SubmissionStatus.RUNTIME_ERROR) {
    return "RT";
  }

  if (status === SubmissionStatus.COMPILATION_ERROR || isNotCalculatedPenaltyStatus(status)) {
    return "CE";
  }

  if (isPending(status)) {
    return "PD";
  }

  return "RJ";
}

export function rankToCodeforcesGymDAT(rank: Rank) {
  let res = "";

  res += `@contest "${rank.contest.name}"
@contlen ${Math.floor(dayjs.duration(rank.contest.endTime.diff(rank.contest.startTime)).asMinutes())}
@problems ${rank.contest.problems.length}
@teams ${rank.teams.length + 100}
@submissions ${rank.submissions.length}
`;

  rank.contest.problems.forEach((p) => {
    res += `@p ${p.label},${p.label},20,0\n`;
  });

  let teamIndex = 1;
  const teamIdMap = new Map<string, number>();
  const submissionsIdMap = new Map<string, Map<string, number>>();

  rank.teams.forEach((team) => {
    let name = team.name;

    if (team.organization) {
      name = `${team.organization} - ${name}`;
    }

    if (team.members) {
      name = `${name} - ${team.membersToString}`;
    }

    res += `@t ${teamIndex},0,1,${name}\n`;
    teamIdMap.set(team.id, teamIndex);
    teamIndex++;

    {
      const mp = new Map<string, number>();
      rank.contest.problems.forEach((p) => {
        mp.set(p.id, 0);
      });
      submissionsIdMap.set(team.id, mp);
    }
  });

  for (let i = 0; i < 100; i++) {
    res += `@t ${teamIndex},0,1,Пополнить команду\n`;
    teamIndex++;
  }

  rank.getSubmissions().forEach((submission) => {
    const teamId = submission.teamId;
    const problemId = submission.problemId;
    const problem = rank.contest.problemsMap.get(problemId);

    if (!problem) {
      return;
    }

    const status = submissionStatusToCodeforcesGymDatStatus(submission.status);
    submissionsIdMap.get(teamId)!.set(problemId, submissionsIdMap.get(teamId)!.get(problemId)! + 1);

    res += `@s ${teamIdMap.get(teamId)},${problem.label},${submissionsIdMap.get(teamId)?.get(problemId)},${submission.timestamp},${status}\n`;
  });

  return res;
}
