"use client";

import * as React from "react";
import { useInView } from "react-intersection-observer";
import { useKeyPressEvent } from "react-use";

import { Resolver, Team } from "@xcpcio/core";
import { cn } from "@/lib/utils";

interface TeamProps {
  index: number;
  team: Team;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
}

const TeamUI: React.FC<TeamProps> = (props) => {
  const { team, index } = props;
  const { ref, entry } = useInView();

  return (
    <div
      ref={ref}
      key={team.id}
      className={cn(
        "flex flex-row gap-x-4 h-24 font-mono text-4xl",
        index % 2 === 0 ? "bg-resolver-bg-0" : "bg-zinc-950",
        props.index === props.currentIndex ? "bg-resolver-selected" : "",
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
              {team.problemStatistics.map((p) => {
                return (
                  <div
                    className={cn(
                      "rounded w-20 h-7 flex justify-center items-center",
                      p.isAccepted() ? "bg-resolver-ac" : "",
                      p.isWrongAnswer() ? "bg-resolver-wa" : "",
                      p.isPending() ? "bg-resolver-pending" : "",
                      p.isUnSubmitted() ? "bg-resolver-untouched" : "",
                    )}
                    key={p.problem.id}
                  >
                    {p.isUnSubmitted() && p.problem.label}
                    {p.isSubmitted && `${p.failedCount + Number(p.isAccepted())}/${p.lastSubmitTimestamp / 60}`}
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

export interface ResolverUIProps {
  resolver?: Resolver;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver } = props;

  const maxIndex = (props.resolver?.teams.length ?? 1) - 1;
  const [currentIndex, setCurrentIndex] = React.useState(maxIndex);

  const handleArrowLeft = () => {
    setCurrentIndex((currentIndex) => {
      ++currentIndex;

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      return currentIndex;
    });
  };

  const handleArrowRight = () => {
    setCurrentIndex((currentIndex) => {
      --currentIndex;

      if (currentIndex < 0) {
        currentIndex = 0;
      }

      return currentIndex;
    });
  };

  useKeyPressEvent("ArrowLeft", null, handleArrowLeft);
  useKeyPressEvent("ArrowRight", null, handleArrowRight);

  return (
    <>
      <div className="flex flex-col justify-between w-screen">
        {resolver?.teams.map((team, index) => {
          return (
            <TeamUI
              team={team}
              index={index}
              currentIndex={currentIndex}
              setCurrentIndex={setCurrentIndex}
              key={team.id}
            ></TeamUI>
          );
        })}
      </div>
    </>
  );
};

export { ResolverUI };
export default ResolverUI;
