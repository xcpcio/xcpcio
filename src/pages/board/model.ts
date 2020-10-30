import {
    deepCopy,
    getJSON,
    getNowTimeStamp,
    removeDuplicateItems,
} from '@/utils';

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
    if (
        contest_config.status === 404 ||
        team.status === 404 ||
        run.status === 404
    ) {
        contest_config = null;
        team = null;
        run = null;
    }
    return { contest_config, team, run };
}

export function getMenu(contest_config: any) {
    const type_ = ['排行榜', '统计分析'];
    const group_ = ['所有队伍', '筛选队伍'];
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

export function getTimeFlag(contest_config: any) {
    let timeFlag = getNowTimeStamp();
    timeFlag = Math.max(timeFlag, contest_config.start_time);
    timeFlag = Math.min(timeFlag, contest_config.end_time);
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
