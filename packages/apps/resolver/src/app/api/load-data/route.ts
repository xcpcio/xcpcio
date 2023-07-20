import { NextRequest, NextResponse } from "next/server";

import { CCPC_FINAL } from "@/lib/constant";
import { IBoardData } from "@/lib/types";

import path from "path";
import fs from "fs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contestName = searchParams.get("contestName") ?? CCPC_FINAL;

  const dir = path.join(process.cwd(), "src/app/api/load-data/data", contestName);

  if (!fs.existsSync(dir)) {
    const data = {
      msg: "contestName not found",
    };

    return NextResponse.json(data, { status: 404 });
  }

  const config = fs.readFileSync(path.join(dir, "config.json"), "utf8");
  const run = fs.readFileSync(path.join(dir, "run.json"), "utf8");
  const team = fs.readFileSync(path.join(dir, "team.json"), "utf8");

  const data: IBoardData = {
    config: config,
    run: run,
    team: team,
  };

  return NextResponse.json(data);
}
