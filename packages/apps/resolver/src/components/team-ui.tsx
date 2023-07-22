"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { Updater } from "use-immer";

import { Team } from "@xcpcio/core";

import { Resolver } from "@/lib/resolver";
import { cn } from "@/lib/utils";

export interface TeamUIProps {
  index: number;
  team: Team;
  resolver: Resolver;
  updateResolver: Updater<Resolver>;
}

const TeamUI: React.FC<TeamUIProps> = (props) => {
  const { team, index, resolver } = props;
  const { ref, entry } = useInView();

  return (
    <div
      ref={ref}
      key={team.id}
      className={cn(
        "flex flex-row gap-x-4 h-24 font-mono text-4xl",
        index % 2 === 0 ? "bg-resolver-bg-0" : "bg-zinc-950",
        resolver.duringAnimation && team.id === resolver.currentTeamId ? "bg-resolver-selected" : "",
        !resolver.duringAnimation && props.index === resolver.currentIndex ? "bg-resolver-selected" : "",
      )}
    >
      {entry?.isIntersecting && (
        <>
          <div className="w-20 flex justify-center items-center">{team.rank}</div>
          <div className="flex-1 flex flex-col justify-center items-start gap-y-3">
            <div className="">
              {team.organization} - {team.name}
            </div>
            <div className="flex flex-row text-sm items-start gap-x-2">
              {team.problemStatistics.map((p, pIx) => {
                return (
                  <div
                    className={cn(
                      "rounded w-20 h-7 flex justify-center items-center",
                      p.isAccepted ? "bg-resolver-ac" : "",
                      p.isWrongAnswer ? "bg-resolver-wa" : "",
                      p.isPending ? "bg-resolver-pending" : "",
                      p.isUnSubmitted ? "bg-resolver-untouched" : "",
                      resolver.problemFlashingEnded === false &&
                        props.index === resolver.currentIndex &&
                        resolver.currentProblemIndex === pIx
                        ? "resolver-uncover"
                        : "",
                    )}
                    key={p.problem.id}
                  >
                    {p.isAccepted &&
                      `${p.failedCount + Number(p.isAccepted)}/${Math.floor(p.lastSubmitTimestamp / 60)}`}
                    {p.isWrongAnswer && `${p.failedCount}/${Math.floor(p.lastSubmitTimestamp / 60)}`}
                    {p.isPending && `${p.failedCount} + ${p.pendingCount}`}
                    {p.isUnSubmitted && p.problem.label}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-48 flex flex-row justify-start items-center">
            <div className="w-1/3">{team.solvedProblemNum}</div>
            <div className="w-2/3">{team.penaltyToMinute()}</div>
          </div>
        </>
      )}
    </div>
  );
};

export { TeamUI };
export default TeamUI;
