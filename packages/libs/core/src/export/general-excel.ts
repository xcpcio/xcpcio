import _ from "lodash";
import * as XLSX from "xlsx-js-style";
import stringWidth from "string-width";

import type { Rank } from "../rank";

export class GeneralExcelConverter {
  constructor() {}

  public convert(rank: Rank): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    const aoa = this.convertToAoa(rank);
    const mainWorksheet = XLSX.utils.aoa_to_sheet(aoa);

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

    mainWorksheet["!cols"] = cols;

    {
      const mergeRange = { s: { r: 0, c: 0 }, e: { r: 0, c: head.length - 1 } };
      const merges = [{ s: mergeRange.s, e: mergeRange.e }];
      mainWorksheet["!merges"] = merges;
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
        const cell = mainWorksheet[cellAddress];
        cell.s = cellStyle;
      }
    }

    {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: 0 });
      const cell = mainWorksheet[cellAddress];
      const titleStyle = _.cloneDeep(cellStyle);
      titleStyle.font.sz = 28;
      titleStyle.font.bold = true;
      cell.s = titleStyle;
    }

    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "Scoreboard");

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

  private convertToAoa(rank: Rank): string[][] {
    const aoa: string[][] = [];

    {
      aoa.push([rank.contest.name]);
    }

    {
      const head: string[] = [];
      head.push("Rank");

      if (rank.contest.organization) {
        head.push(rank.contest.organization);
      }

      head.push("Name", "Solved", "Penalty", ...rank.contest.problems.map(p => p.label), "Dict");
      aoa.push(head);
    }

    for (const team of rank.teams) {
      const arr: string[] = [];

      arr.push(team.rank.toString());
      if (team.organization) {
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

      arr.push(`${team.dict}%`);

      aoa.push(arr);
    }

    return aoa;
  }
}
