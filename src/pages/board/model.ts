import {
  deepCopy,
  getJSON,
  getNowTimeStamp,
  removeDuplicateItems,
  getStarKey,
  getQueryString,
} from '@/utils';

export const fetchIntervalTime = 30 * 1000;

export async function fetchData() {
  const pathname = window.location.pathname;
  let contest_config: any = await getJSON(
    [pathname, `config.json?t=${getNowTimeStamp()}`].join('/'),
  );
  let team: any = await getJSON(
    [pathname, `team.json?t=${getNowTimeStamp()}`].join('/'),
  );
  let run: any = await getJSON(
    [pathname, `run.json?t=${getNowTimeStamp()}`].join('/'),
  );
  if (contest_config?.status === 404) contest_config = null;
  if (team?.status === 404) team = null;
  if (run?.status === 404) run = null;
  return { contest_config, team, run };
}

export function getMenu(contest_config: any) {
  const type_ = ['排行榜', '发气球', '统计分析', '导出榜单'];
  const group_ = ['所有队伍', '关注队伍'];
  const fgroup_ = ['all', 'filter'];

  let menu_item = {
    type: deepCopy(type_),
    group: deepCopy(group_),
  };

  let fgroup = deepCopy(fgroup_);

  if (contest_config.group) {
    for (let k in contest_config.group) {
      let v = contest_config.group[k];
      fgroup.push(k);
      menu_item.group.push(v);
    }
  }
  return { menu_item, fgroup };
}

export function getCurrentGroup(search: any, group: any, fgroup: any) {
  let currentGroup = 'all';
  const params = new URLSearchParams(search);
  if (params.get('group')) {
    const index = group.indexOf(params.get('group') || '');
    if (index !== -1) {
      currentGroup = fgroup[index];
    }
  }
  return currentGroup;
}

export function getTimeFlag(contest_config: any, search: any) {
  let timeFlag: any = getQueryString('timeflag', search);
  let now = getNowTimeStamp();
  if (timeFlag == null) {
    timeFlag = now.toString();
  }
  timeFlag = parseInt(timeFlag || '');
  if (now > contest_config.end_time) now = contest_config.end_time;
  if (now < contest_config.start_time) now = contest_config.start_time;
  if (timeFlag > now) timeFlag = now;
  if (timeFlag < contest_config.start_time)
    timeFlag = contest_config.start_time;
  return Math.ceil(timeFlag - contest_config.start_time);
}

export function getOrganization(team: any) {
  let organization: any = [];
  for (let team_id in team) {
    if (team[team_id].organization) {
      organization.push(team[team_id].organization);
    }
  }
  return removeDuplicateItems(organization);
}

export function getCurrentOrganization(search: any) {
  let params = new URLSearchParams(search);
  if (params.get('organization')) {
    return JSON.parse(params.get('organization') || '');
  }
  return [];
}

const INF = 0x3f3f3f3f;

export function getConfig(contest_config: any, group: any) {
  let config = deepCopy(contest_config);
  if (config.medal) {
    delete config.medal;
    if (contest_config.medal[group])
      config.medal = deepCopy(contest_config.medal[group]);
  }
  return config;
}

export function getTeam(team: any, group: any, search: any) {
  let organization = getCurrentOrganization(search);
  organization = new Set(organization);
  for (let team_id in team) {
    let item = team[team_id];
    item.filter = 0;
    item.organization_filter = 0;
    if (window.localStorage.getItem(getStarKey(team_id))) {
      item.concerned = 1;
      item.filter = 1;
    }
    if (organization.has(team[team_id]?.['organization'])) {
      item.organization_filter = 1;
      item.filter = 1;
    }
  }
  const team_list = (() => {
    let team_list: any = {};
    for (let team_id in team) {
      let item = team[team_id];
      if (item[group] === 1) {
        team_list[team_id] = item;
      }
    }
    return team_list;
  })();
  return team_list;
}

export function getRun(run: any, team: any, timeFlag: any) {
  let _run = (() => {
    let _run: any = [];
    run.forEach((item: any) => {
      if (item.timestamp <= timeFlag) {
        _run.push(item);
      }
    });
    _run.sort((a: any, b: any) => {
      if (a.timestamp < b.timestamp) return -1;
      if (a.timestamp > b.timestamp) return 1;
      if (b.status === 'correct' && a.status !== 'correct') return -1;
      if (a.status === 'correct' && b.status !== 'correct') return 1;
      return 0;
    });
    return _run;
  })();

  let new_run = (() => {
    let map = new Map();
    let set = new Set(Object.keys(team));
    let new_run: any = [];
    _run.forEach((item: any) => {
      if (set.has(item.team_id.toString())) {
        const id = [item.team_id, item.problem_id].join('-');
        if (!map.has(id) || map.get(id) == INF) {
          new_run.push(item);
          if (item.status === 'correct') {
            map.set(id, item.timestamp);
          } else {
            map.set(id, INF);
          }
        }
      }
    });
    return new_run;
  })();

  return new_run;
}
