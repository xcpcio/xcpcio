import * as XLSX from "xlsx";

import type { Rank } from "../rank";

export class GeneralExcelConverter {
  constructor() {}

  public convert(_rank: Rank): XLSX.WorkBook {
    const workbook = XLSX.utils.book_new();
    return workbook;
  }

  public convertAndWrite(rank: Rank, filename: string): any {
    return XLSX.writeFile(this.convert(rank), filename, { compression: true });
  }
}
