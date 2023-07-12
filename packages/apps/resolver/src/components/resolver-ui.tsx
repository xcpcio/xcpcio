"use client";

import * as React from "react";
import { useKey, useKeyPressEvent } from "react-use";

import { Resolver } from "@xcpcio/core";

import { TeamUI } from "./team-ui";

export interface ResolverUIProps {
  resolver?: Resolver;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver } = props;

  const maxIndex = (props.resolver?.teams.length ?? 1) - 1;
  const [currentIndex, setCurrentIndex] = React.useState(maxIndex);

  const handleArrowUp = () => {
    setCurrentIndex((currentIndex) => {
      --currentIndex;

      if (currentIndex < 0) {
        currentIndex = 0;
      }

      return currentIndex;
    });
  };

  const handleArrowDown = () => {
    setCurrentIndex((currentIndex) => {
      ++currentIndex;

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      return currentIndex;
    });
  };

  useKeyPressEvent("ArrowRight", null, handleArrowUp);
  useKey("w", handleArrowUp);

  useKeyPressEvent("ArrowLeft", null, handleArrowDown);
  useKey("s", handleArrowDown);

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
