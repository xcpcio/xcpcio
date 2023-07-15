"use client";

import * as React from "react";
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

    const resolver = new Resolver(contest, teams, submissions);
    resolver.buildResolver();

    updateResolver(resolver);
    setLoaded(true);
  }, [boardData, setLoaded, updateResolver]);

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
