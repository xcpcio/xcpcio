"use client";

import * as React from "react";
import { Updater } from "use-immer";
import FlipMove from "react-flip-move";

import { Resolver } from "@/lib/resolver";
import { cn } from "@/lib/utils";

import { TeamUI } from "./team-ui";

export interface ResolverUIProps {
  resolver: Resolver;
  updateResolver: Updater<Resolver>;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver, updateResolver } = props;

  const onStartAll = React.useCallback(() => {
    updateResolver((resolver) => {
      resolver.duringAnimation = true;
    });
  }, [updateResolver]);

  const onFinishAll = React.useCallback(() => {
    setTimeout(() => {
      updateResolver((resolver) => {
        resolver.duringAnimation = false;
      });
    }, 128);
  }, [updateResolver]);

  return (
    <>
      <div className="flex flex-col justify-between w-screen">
        <FlipMove
          staggerDelayBy={5}
          duration={Math.min(10, Math.max(3, Math.abs(resolver.oldRank - resolver.newRank))) * 128}
          easing={
            Math.abs(resolver.oldRank - resolver.newRank) * 96 <= window.innerHeight
              ? "linear"
              : "cubic-bezier(1, 0, 1, 0.75)"
          }
          appearAnimation="fade"
          enterAnimation="fade"
          leaveAnimation="fade"
          maintainContainerHeight={true}
          typeName={null}
          onStartAll={onStartAll}
          onFinishAll={onFinishAll}
        >
          {resolver.teams.map((team, index) => (
            <div
              key={team.id}
              className={cn(
                // https://github.com/facebook/react/issues/27044
                "no-overflow-anchoring",
                team.id === resolver.currentTeamId ? "z-[999]" : "z-[0]",
              )}
            >
              <TeamUI {...props} team={team} index={index}></TeamUI>
            </div>
          ))}
        </FlipMove>
      </div>
    </>
  );
};

export { ResolverUI };
export default ResolverUI;
