"use client";

import * as React from "react";
import { useImmer } from "use-immer";
import { enableMapSet, enablePatches } from "immer";
import { useKey, useKeyPressEvent } from "react-use";
import FlipMove from "react-flip-move";

import { createContest, createSubmissions, createTeams } from "@xcpcio/core";

import { Resolver } from "@/lib/resolver";
import { cn } from "@/lib/utils";

import { TeamUI } from "./team-ui";
import { IBoardData } from "@/lib/types";

import "./resolver-ui.css";

enableMapSet();
enablePatches();

export interface ResolverUIProps {
  boardData: IBoardData;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { boardData } = props;

  const [resolver, updateResolver] = useImmer<Resolver>(() => {
    const r = new Resolver(
      createContest(JSON.parse(boardData?.config ?? "{}")),
      createTeams(JSON.parse(boardData?.team ?? "[]")),
      createSubmissions(JSON.parse(boardData?.run ?? "[]")),
    );

    r.buildResolver();

    return r;
  });

  const handleArrowUp = React.useCallback(() => {
    updateResolver((resolver) => {
      resolver.up();
    });
  }, [updateResolver]);

  const handleArrowDown = React.useCallback(() => {
    updateResolver((resolver) => {
      resolver.down();
    });
  }, [updateResolver]);

  const handleArrowRight = React.useCallback(() => {
    updateResolver((resolver) => {
      resolver.right();
    });
  }, [updateResolver]);

  const handleArrowLeft = React.useCallback(() => {
    updateResolver((resolver) => {
      resolver.left();
    });
  }, [updateResolver]);

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    updateResolver((resolver) => {
      if (!resolver.startScrollUp) {
        return;
      }

      if (resolver.problemFlashingEnded === true) {
        resolver.problemFlashingEnded = false;

        timeoutId = setTimeout(() => {
          updateResolver((resolver) => {
            resolver.problemFlashingEnded = true;
          });
        }, resolver.FLASHING_TIME_MS);
      }

      resolver.scrollUp();
    });

    if (timeoutId !== null) {
      return () => {
        clearTimeout(timeoutId as NodeJS.Timeout);
      };
    }
  }, [resolver, updateResolver]);

  React.useEffect(() => {
    updateResolver((resolver) => {
      if (!resolver.startScrollDown) {
        return;
      }

      resolver.scrollDown();
    });
  }, [resolver, updateResolver]);

  useKey("w", handleArrowUp);
  useKeyPressEvent("i", undefined, handleArrowUp);

  useKey("s", handleArrowDown);
  useKeyPressEvent("k", undefined, handleArrowDown);

  useKey("d", handleArrowRight);
  useKeyPressEvent("l", undefined, handleArrowRight);

  useKey("a", handleArrowLeft);
  useKeyPressEvent("j", undefined, handleArrowLeft);

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
              <TeamUI {...props} team={team} index={index} resolver={resolver} updateResolver={updateResolver}></TeamUI>
            </div>
          ))}
        </FlipMove>
      </div>
    </>
  );
};

export { ResolverUI };
export default ResolverUI;
