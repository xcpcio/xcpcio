"use client";

import * as React from "react";

import { Resolver } from "@xcpcio/core";
import { cn } from "@/lib/utils";

export interface ResolverUIProps {
  resolver?: Resolver;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver } = props;

  return (
    <>
      <div className="flex flex-col justify-between w-screen">
        {resolver?.teams.map((team, index) => {
          return (
            <div
              key={team.id}
              className={cn("flex flex-row gap-x-4 h-24 font-mono", index % 2 === 0 ? "bg-zinc-800" : "bg-zinc-950")}
            >
              <div className="w-20 text-4xl flex justify-center items-center">{team.rank}</div>
              <div className="flex-1 flex justify-start items-center">
                <div className="h-4/6 text-4xl">
                  {team.organization}-{team.name}
                </div>
                <div className="h=2/6"></div>
              </div>
              <div className="w-48 text-4xl flex flex-row justify-start items-center">
                <div className="w-1/3">{team.solvedProblemNum}</div>
                <div className="w-2/3">{team.penaltyToMinute()}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export { ResolverUI };
export default ResolverUI;
