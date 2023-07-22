import { NextRequest, NextResponse } from "next/server";

import { IBoardData } from "@/lib/types";

const DATA_HOST = "https://board.xcpcio.com/data";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dataSource = searchParams.get("data-source") ?? "";

  const [configResp, teamResp, runResp] = await Promise.all([
    fetch(`${DATA_HOST}/${dataSource}/config.json`, { cache: "no-store", mode: "no-cors" }),
    fetch(`${DATA_HOST}/${dataSource}/team.json`, { cache: "no-store", mode: "no-cors" }),
    fetch(`${DATA_HOST}/${dataSource}/run.json`, { cache: "no-store", mode: "no-cors" }),
  ]);

  if (configResp.status !== 200 || teamResp.status !== 200 || runResp.status !== 200) {
    const data = {
      msg: "fetch data failed",
    };

    return NextResponse.json(data, { status: 500 });
  }

  const data: IBoardData = {
    config: await configResp.text(),
    team: await teamResp.text(),
    run: await runResp.text(),
  };

  return NextResponse.json(data);
}
