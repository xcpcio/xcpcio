"use client";

import * as React from "react";

import { createContest, createTeams, createSubmissions, Resolver } from "@xcpcio/core";

import { useLoadBoardData } from "@/lib/local-storage";
import { ResolverUI } from "@/components/resolver-ui";

export default function Page() {
  const [loaded, setLoaded] = React.useState(false);

  const [data, setData] = React.useState<Resolver | undefined>(undefined);

  const [boardData, ,] = useLoadBoardData();

  React.useEffect(() => {
    const contest = createContest(JSON.parse(boardData?.config ?? "{}"));
    const teams = createTeams(JSON.parse(boardData?.team ?? "[]"));
    const submissions = createSubmissions(JSON.parse(boardData?.run ?? "[]"));

    const resolver = new Resolver(contest, teams, submissions);
    resolver.buildRank();

    setData(resolver);
    setLoaded(true);
  }, [boardData, setLoaded, setData]);

  return (
    <main className="flex min-h-screen">
      {!loaded && <p>loading data...</p>}
      {loaded && <ResolverUI resolver={data}></ResolverUI>}
    </main>
  );
}
