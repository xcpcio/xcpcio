export class Pagination {
  totalSize: number;

  currentPage: number;
  pageSize: number;

  constructor() {
    this.totalSize = 0;

    this.currentPage = 0;
    this.pageSize = 16;
  }

  get totalPage() {
    return Math.floor((this.totalSize + this.pageSize - 1) / this.pageSize);
  }

  get currentLeft() {
    return this.currentPage * this.pageSize;
  }

  get currentRight() {
    return Math.min(this.totalSize, (this.currentPage + 1) * this.pageSize);
  }

  get leftDecrPage() {
    const res = [];

    let step = 1;
    let cur = this.currentPage - step;

    while (cur > 0) {
      res.push(cur);

      step = step << 1;
      cur -= step;
    }

    return res;
  }

  get rightIncrPage() {
    const res = [];

    let step = 1;
    let cur = this.currentPage + step;

    while (cur < this.totalPage) {
      res.push(cur);

      step = step << 1;
      cur += step;
    }

    return res;
  }

  onPageChange(options: {
    to?: number,
    diff?: number,
  }) {
    const totalPage = this.totalPage;

    let to = this.currentPage;

    if (options?.to !== undefined) {
      to = options.to;
    }

    if (options?.diff !== undefined) {
      const diff = options.diff;
      to = to + diff;
    }

    if (to < 0 || to >= totalPage) {
      return;
    }

    this.currentPage = to;
  }
}

export const class_pagination_ix = "flex items-center justify-center px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white leading-tight";
export const class_pagination_ix_current = "flex items-center justify-center px-3 py-2 text-sm leading-tight border hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white text-primary-600 z-10 bg-primary-50 border-primary-300 hover:bg-primary-100";
export const class_pagination_ix_pre = "flex items-center justify-center px-3 text-gray-500 bg-white border hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white border-gray-300 h-full py-1.5 ml-0 rounded-l-lg hover:text-gray-700 dark:border-gray-700";
export const class_pagination_ix_nx = "flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white";
