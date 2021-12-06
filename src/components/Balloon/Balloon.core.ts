function formatTimeNumber(time: number) {
  if (time < 9) return ['0', time].join('');
  return time;
}

export function getSolvedId(team_id: string, problem_id: number) {
  return [team_id, problem_id].join('#$#');
}

export function getDisplayTime(time: number) {
  return [
    formatTimeNumber(Math.floor(time / 60 / 60)),
    formatTimeNumber(Math.floor((time / 60) % 60)),
    formatTimeNumber(Math.floor(time % 60)),
  ].join(':');
}

export function getBalloonDispatchedListKey() {
  return [window.location.pathname, 'balloon', 'dispatched', 'list'].join('_');
}
