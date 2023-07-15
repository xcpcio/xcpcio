"use client";

import * as React from "react";
import { useKey, useKeyPressEvent } from "react-use";
import { Updater } from "use-immer";

import { Teams } from "@xcpcio/core";

import { Resolver } from "@/lib/resolver";

import { TeamUI } from "./team-ui";

export interface ResolverUIProps {
  resolver: Resolver;
  updateResolver: Updater<Resolver>;
  teams?: Teams;
  updateTeams?: Updater<Teams>;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver, updateResolver } = props;

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
    updateResolver((resolver) => {
      resolver.teamScroll();
    });
  }, [resolver, updateResolver]);

  useKey("w", handleArrowUp);
  useKeyPressEvent("i", null, handleArrowUp);

  useKey("s", handleArrowDown);
  useKeyPressEvent("k", null, handleArrowDown);

  useKey("d", handleArrowRight);
  // useKeyPressEvent("l", null, handleArrowRight);

  useKey("a", handleArrowLeft);
  // useKeyPressEvent("j", null, handleArrowLeft);

  return (
    <>
      <div className="flex flex-col justify-between w-screen">
        {resolver.teams.map((team, index) => (
          <TeamUI {...props} team={team} index={index} key={team.id}></TeamUI>
        ))}
      </div>
    </>
  );
};

export { ResolverUI };
export default ResolverUI;
