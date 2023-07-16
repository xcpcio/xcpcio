"use client";

import * as React from "react";
import { Updater } from "use-immer";

import { Resolver } from "@/lib/resolver";

import { TeamUI } from "./team-ui";

export interface ResolverUIProps {
  resolver: Resolver;
  updateResolver: Updater<Resolver>;
}

const ResolverUI: React.FC<ResolverUIProps> = (props) => {
  const { resolver } = props;

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
