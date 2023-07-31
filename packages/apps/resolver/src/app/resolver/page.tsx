"use client";

import * as React from "react";
import _ from "lodash";

import { useSearchParams } from "next/navigation";

import { useLoadBoardData } from "@/lib/local-storage";
import type { IBoardData } from "@/lib/types";

import { ResolverUI } from "@/components/resolver-ui";
import { toast } from "@/components/ui/use-toast";

export default function Page() {
  const [loaded, setLoaded] = React.useState(false);
  const [boardDataInLocalStorage, ,] = useLoadBoardData();
  const [boardData, setBoardData] = React.useState({} as IBoardData);

  const searchParams = useSearchParams();
  const xcpcioDataSource = searchParams.get("xcpcio-data-source");

  const fetchData = React.useCallback(async () => {
    const f = _.throttle(async () => {
      const boardDataResp = await fetch(`/api/load-xcpcio-data?data-source=${xcpcioDataSource}`);
      if (boardDataResp.status === 200) {
        setBoardData(JSON.parse(await boardDataResp.text()));
        setLoaded(true);
      } else {
        toast({
          title: "Fetch Data Failed",
          description: `code: ${boardDataResp.status}, err: ${
            JSON.parse(await boardDataResp.text())?.msg ?? "unknown"
          }`,
        });
      }
    }, 1000);

    await f();
  }, [xcpcioDataSource]);

  React.useEffect(() => {
    if (xcpcioDataSource !== null) {
      fetchData();
    }
  }, [fetchData, xcpcioDataSource]);

  React.useEffect(() => {
    if (xcpcioDataSource === null) {
      setBoardData(boardDataInLocalStorage as IBoardData);
      setLoaded(true);
    }
  }, [boardData, boardDataInLocalStorage, setLoaded, xcpcioDataSource]);

  return (
    <main className="flex min-h-screen min-w-screen">
      {!loaded && (
        <div className="flex justify-center items-center w-full">
          <p>loading data...</p>
        </div>
      )}
      {loaded && <ResolverUI boardData={boardData}></ResolverUI>}
    </main>
  );
}
