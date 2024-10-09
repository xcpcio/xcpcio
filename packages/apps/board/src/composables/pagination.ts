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

    return res.reverse();
  }

  get rightIncrPage() {
    const res = [];

    let step = 1;
    let cur = this.currentPage + step;

    while (cur + 1 < this.totalPage) {
      res.push(cur);

      step = step << 1;
      cur += step;
    }

    return res;
  }

  onPageChange(options: {
    to?: number;
    diff?: number;
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
