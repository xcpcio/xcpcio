import type { Lang } from "@xcpcio/types";

import type { Rank } from "../rank";
import _ from "lodash";
import stringWidth from "string-width";
import * as XLSX from "xlsx-js-style";

import { isValidMedalType } from "../award";

enum SpecialCellType {
  FIRST_SOLVED = "firstSolved",
}

interface SpecialCell {
  row: number;
  col: number;
  type: SpecialCellType;
}

interface AoaConvertResult {
  aoa: string[][];
  specialCells: SpecialCell[];
}

export class GeneralExcelConverter {
  lang?: Lang;

  constructor(lang?: Lang) {
    this.lang = lang;
  }

  public convert(oriRank: Rank): XLSX.WorkBook {
    const rank = _.cloneDeep(oriRank);

    rank.options.disableFilterTeamsByGroup();
    rank.options.disableFilterSubmissionByTimestamp();

    const workbook = XLSX.utils.book_new();

    for (const [k, v] of rank.contest.group) {
      rank.options.setGroup(k);
      rank.buildRank();

      const sheet = this.convertToSheet(rank);
      XLSX.utils.book_append_sheet(workbook, sheet, v.name.getOrDefault(this.lang));
    }

    return workbook;
  }

  public convertAndWrite(rank: Rank, filename: string): any {
    return XLSX.writeFile(
      this.convert(rank),
      filename,
      {
        compression: true,
      },
    );
  }

  private convertToSheet(rank: Rank): XLSX.WorkSheet {
    const aoa = this.convertToAoa(rank);
    const sheet = XLSX.utils.aoa_to_sheet(aoa.aoa);

    const cols = [];
    const head = aoa.aoa[1];
    for (let j = 0; j < head.length; j++) {
      let wch = 10;
      for (let i = 1; i < aoa.aoa.length; i++) {
        wch = Math.max(wch, stringWidth(aoa.aoa[i][j]) + 2);
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

    const firstSolvedCellStyle = {
      ...cellStyle,
      fill: {
        fgColor: { rgb: "009900" },
      },
    };

    for (let i = 1; i < aoa.aoa.length; i++) {
      for (let j = 0; j < aoa.aoa[i].length; j++) {
        const cellAddress = XLSX.utils.encode_cell({ r: i, c: j });
        const cell = sheet[cellAddress];
        const specialCell = aoa.specialCells.find(sc => sc.row === i && sc.col === j);
        if (specialCell?.type === SpecialCellType.FIRST_SOLVED) {
          cell.s = firstSolvedCellStyle;
        } else {
          cell.s = cellStyle;
        }
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

  private convertToAoa(rank: Rank): AoaConvertResult {
    const aoa: string[][] = [];
    const specialCells: SpecialCell[] = [];

    const enableAwards = rank.contest.isEnableAwards(rank.options.group);
    const enableMembers = rank.teams[0]?.members.length > 0;
    const enableCoach = rank.teams[0]?.coaches.length > 0;

    {
      aoa.push([rank.contest.name.getOrDefault(this.lang)]);
    }

    {
      const head: string[] = [];
      head.push("Rank");

      if (rank.contest.options.enableOrganization) {
        head.push("Organization Rank");
        head.push("Organization");
      }

      head.push("Team", "Solved", "Penalty", ...rank.contest.problems.map(p => p.label), "Dirt");

      if (enableAwards) {
        head.push("Medal");
      }

      if (enableMembers) {
        head.push("Member1", "Member2", "Member3");
      }

      if (enableCoach) {
        head.push("Coaches");
      }

      head.push("Unofficial");
      head.push("Girl");
      head.push("ICPC ID");

      aoa.push(head);
    }

    for (const team of rank.teams) {
      const arr: string[] = [];

      arr.push(team.rank.toString());

      if (team.organization) {
        if (team.isFirstRankOfOrganization) {
          arr.push(team.organization.rank.toString());
        } else {
          arr.push("");
        }

        arr.push(team.organization.name.getOrDefault(this.lang));
      }

      arr.push(team.name.getOrDefault(this.lang), team.solvedProblemNum.toString(), team.penaltyToMinute.toString());

      for (const p of team.problemStatistics) {
        if (p.isUnSubmitted) {
          arr.push("-");
        }

        if (p.isSolved) {
          arr.push(`+${p.totalCount}(${p.solvedTimestampToMinute})`);
          if (p.isFirstSolved) {
            specialCells.push({
              row: aoa.length,
              col: arr.length - 1,
              type: SpecialCellType.FIRST_SOLVED,
            });
          }
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
          arr.push(members[0]?.name.getOrDefault(this.lang) ?? "");
          arr.push(members[1]?.name.getOrDefault(this.lang) ?? "");
          arr.push(members[2]?.name.getOrDefault(this.lang) ?? "");
        } else {
          arr.push("", "", "");
        }
      }

      if (enableCoach) {
        arr.push(team.coachesToString());
      }

      arr.push(team.isUnofficial ? "Y" : "N");
      arr.push(team.isGirl ? "Y" : "N");
      arr.push(team.icpcID ?? "");

      aoa.push(arr);
    }

    return { aoa, specialCells };
  }
}
