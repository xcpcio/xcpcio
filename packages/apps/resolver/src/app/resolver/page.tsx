"use client";

import * as React from "react";
import { useKey, useKeyPressEvent } from "react-use";
import { useImmer } from "use-immer";
import { enableMapSet, enablePatches } from "immer";

import { createContest, createTeams, createSubmissions, Contest } from "@xcpcio/core";

import { Resolver } from "@/lib/resolver";

import { useLoadBoardData } from "@/lib/local-storage";
import { ResolverUI } from "@/components/resolver-ui";

enableMapSet();
enablePatches();

export default function Page() {
  const [loaded, setLoaded] = React.useState(false);
  const [boardData, ,] = useLoadBoardData();
  const [resolver, updateResolver] = useImmer<Resolver>(new Resolver(new Contest(), [], []));

  React.useEffect(() => {
    const contest = createContest(JSON.parse(boardData?.config ?? "{}"));
    const teams = createTeams(JSON.parse(boardData?.team ?? "[]"));
    const submissions = createSubmissions(JSON.parse(boardData?.run ?? "[]"));

    const resolverC = new Resolver(contest, teams, submissions);
    resolverC.buildResolver();

    updateResolver(resolverC);
    setLoaded(true);
  }, [boardData, setLoaded, updateResolver]);

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
      resolver.teamScrollUp();
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

  return (
    <main className="flex min-h-screen min-w-screen">
      {!loaded && (
        <div className="flex w-full justify-center items-center">
          <p>loading data...</p>
        </div>
      )}
      {loaded && <ResolverUI resolver={resolver} updateResolver={updateResolver}></ResolverUI>}
    </main>
  );
}
