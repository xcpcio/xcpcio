import _ from "lodash";
import * as XLSX from "xlsx-js-style";
import stringWidth from "string-width";

import { isValidMedalType } from "../award";
import type { Rank } from "../rank";

export class GeneralExcelConverter {
  constructor() {}

  public convert(oriRank: Rank): XLSX.WorkBook {
    const rank = _.cloneDeep(oriRank);

    rank.options.disableFilterTeamsByGroup();
    rank.options.disableFilterSubmissionByTimestamp();

    const workbook = XLSX.utils.book_new();

    for (const [k, v] of rank.contest.group) {
      rank.options.setGroup(k);
      rank.buildRank();

      const sheet = this.convertToSheet(rank);
      XLSX.utils.book_append_sheet(workbook, sheet, v.names.get(v.defaultLang) as string);
    }

    return workbook;
  }

  public convertAndWrite(rank: Rank, filename: string): any {
    return XLSX.writeFile(
      this.convert(rank),
      filename,
      {
        compression: true,
      });
  }

  private convertToSheet(rank: Rank): XLSX.WorkSheet {
    const aoa = this.convertToAoa(rank);
    const sheet = XLSX.utils.aoa_to_sheet(aoa);

    const cols = [];
    const head = aoa[1];
    for (let j = 0; j < head.length; j++) {
      let wch = 10;
      for (let i = 1; i < aoa.length; i++) {
        wch = Math.max(wch, stringWidth(aoa[i][j]) + 2);
      }

      cols.push({
        wch,
      });
    }

    sheet["!cols"] = cols;

    {
      const mergeRange = { s: { r: 0, c: 0 }, e: { r: 0, c: head.length - 1 } };
      const merges = [{ s: mergeRange.s, e: mergeRange.e }];
      sheet["!merges"] = merges;
    }

    const font = {
      name: "Arial Unicode MS",
      bold: false,
      italic: false,
      sz: 12,
    };

    const borderStyle = {
      style: "thin",
    };

    const cellStyle = {
      alignment: {
        vertical: "center",
        horizontal: "center",
      },
      border: {
        top: borderStyle,
        bottom: borderStyle,
        left: borderStyle,
        right: borderStyle,
      },
      font,
    };

    for (let i = 1; i < aoa.length; i++) {
      for (let j = 0; j < aoa[i].length; j++) {
        const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
        const cell = sheet[cellAddress];
        cell.s = cellStyle;
      }
    }

    {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: 0 });
      const cell = sheet[cellAddress];
      const titleStyle = _.cloneDeep(cellStyle);
      titleStyle.font.sz = 28;
      titleStyle.font.bold = true;
      cell.s = titleStyle;
    }

    return sheet;
  }

  private convertToAoa(rank: Rank): string[][] {
    const aoa: string[][] = [];

    const enableAwards = rank.contest.isEnableAwards(rank.options.group);
    const enableMembers = (Array.isArray(rank.teams) && rank.teams[0]?.members) ?? false;
    const enableCoach = rank.teams[0]?.coach ?? false;

    {
      aoa.push([rank.contest.name]);
    }

    {
      const head: string[] = [];
      head.push("Rank");

      if (rank.contest.organization) {
        head.push(`${rank.contest.organization} Rank`);
        head.push(rank.contest.organization);
      }

      head.push("Name", "Solved", "Penalty", ...rank.contest.problems.map(p => p.label), "Dirt");

      if (enableAwards) {
        head.push("Medal");
      }

      if (enableMembers) {
        head.push("Member1", "Member2", "Member3");
      }

      if (enableCoach) {
        head.push("Coach");
      }

      aoa.push(head);
    }

    for (const team of rank.teams) {
      const arr: string[] = [];

      arr.push(team.rank.toString());
      if (team.organization) {
        if (team.organizationRank !== -1) {
          arr.push(team.organizationRank.toString());
        } else {
          arr.push("");
        }

        arr.push(team.organization);
      }

      arr.push(team.name, team.solvedProblemNum.toString(), team.penaltyToMinute.toString());

      for (const p of team.problemStatistics) {
        if (p.isUnSubmitted) {
          arr.push("-");
        }

        if (p.isSolved) {
          arr.push(`+${p.totalCount}(${p.solvedTimestampToMinute})`);
        }

        if (p.isWrongAnswer) {
          arr.push(`-${p.failedCount}`);
        }

        if (p.isPending) {
          arr.push(`? ${p.failedCount} + ${p.pendingCount}`);
        }
      }

      arr.push(`${team.dirt}%`);

      if (enableAwards) {
        const medals = team.awards
          .filter(a => isValidMedalType(a))
          .map(a => a.toString());
        arr.push(medals.join(", "));
      }

      if (enableMembers) {
        const members = team.members;
        if (Array.isArray(members)) {
          arr.push(members[0] ?? "");
          arr.push(members[1] ?? "");
          arr.push(members[2] ?? "");
        } else {
          arr.push("", "", "");
        }
      }

      if (enableCoach) {
        if (typeof team.coach === "string") {
          arr.push(team.coach ?? "");
        } else {
          arr.push("");
        }
      }

      aoa.push(arr);
    }

    return aoa;
  }
}
