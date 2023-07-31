import path from "node:path";
import fs from "node:fs";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { CCPC_FINAL } from "@/lib/constant";
import type { IBoardData } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contestName = searchParams.get("contestName") ?? CCPC_FINAL;

  // eslint-disable-next-line n/prefer-global/process
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
    config,
    run,
    team,
  };

  return NextResponse.json(data);
}
