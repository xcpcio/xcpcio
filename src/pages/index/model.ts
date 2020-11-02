import { deepCopy, getTimeDiff, getJSON, getNowTimeStamp } from '@/utils';

export async function fetchData() {
    const contest_list: any = await getJSON(
        `contest_list.json?t=${getNowTimeStamp()}`,
    );
    if (contest_list.status === 404) return null;
    return contest_list;
}

export function getTreeData(contest_list: any) {
    let treeData: any;
    const dfs = (contest_list: any, path: string) => {
        let children: any = [];
        for (let k in contest_list) {
            let item: any = {};
            item['title'] = k;
            item['value'] = [path, k].join('/');
            if (!contest_list[k]['config']) {
                children.push(item);
            }
        }
        children.forEach((children: any, index: number) => {
            children['children'] = dfs(
                contest_list[children.title],
                children.value,
            );
        });
        return children;
    };
    treeData = [
        {
            title: 'CONTEST',
            value: '',
            children: [],
        },
    ];
    treeData[0]['children'] = dfs(contest_list, '');
    return treeData;
}

export function getContest(path: string, contest_list: any) {
    let contest: any = [];
    const dfs = (contest_list: any, contest: any) => {
        if (!contest_list['config']) {
            for (let k in contest_list) {
                dfs(contest_list[k], contest);
            }
        } else {
            let item = deepCopy(contest_list.config);
            item['link'] = deepCopy(contest_list.link);
            contest.push(item);
        }
    };
    let _path = path.split('/');
    _path.splice(0, 1);
    let _contest_list = deepCopy(contest_list);
    _path.forEach((path: string) => {
        if (_contest_list[path] != undefined) {
            _contest_list = _contest_list[path];
        } else {
            _contest_list = null;
        }
    });
    if (_contest_list == null) {
        return contest;
    }
    dfs(_contest_list, contest);
    contest.sort((a: any, b: any) => {
        if (a.start_time < b.start_time) return 1;
        if (a.start_time > b.start_time) return -1;
        return 0;
    });
    return contest;
}

export function getDuration(start_time: number, end_time: number) {
    return getTimeDiff(end_time - start_time);
}
