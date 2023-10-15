export function calcDirt(attemptedNum: number, solvedNum: number) {
  if (solvedNum === 0) {
    return 0;
  }

  return Math.floor((attemptedNum - solvedNum) * 100 / attemptedNum);
}
