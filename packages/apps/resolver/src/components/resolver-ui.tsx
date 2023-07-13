"use client";

import * as React from "react";
import { useKey, useKeyPressEvent } from "react-use";
import { Updater } from "use-immer";

import { Resolver } from "@xcpcio/core";

import { TeamUI } from "./team-ui";

export interface ResolverUIProps {
  resolver: Resolver;
  updateResolver: Updater<Resolver>;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver, updateResolver } = props;

  const handleArrowUp = () => {
    updateResolver((resolver) => resolver.up());
  };

  const handleArrowDown = () => {
    updateResolver((resolver) => resolver.down());
  };

  useKeyPressEvent("ArrowRight", null, handleArrowUp);
  useKey("w", handleArrowUp);

  useKeyPressEvent("ArrowLeft", null, handleArrowDown);
  useKey("s", handleArrowDown);

  return (
    <>
      <div className="flex flex-col justify-between w-screen">
        {resolver?.teams.map((team, index) => {
          return <TeamUI {...props} team={team} index={index} key={team.id}></TeamUI>;
        })}
      </div>
    </>
  );
};

export { ResolverUI };
export default ResolverUI;
