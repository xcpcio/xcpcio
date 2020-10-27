import React from 'react';
import Loading from '@/components/Loading/Loading';
import {
    getJSON,
    getTimeDiff,
    getNowTimeStamp,
    deepCopy,
    getStarKey,
    removeDuplicateItems,
} from '@/utils/utils';
import Progress from '@/components/progress/progress';
import SecondLevelMenu from '@/components/second-level-menu/second-level-menu';
import Standings from '@/components/standings/standings';
import Statistics from '@/components/Statistics/statistics';
import style from './board.less';
import Selected from '@/components/Selected/selected';

const INF = 0x3f3f3f3f;
let pathname = '';

let contest_config: any = {};
let team: any = {};
let run: any = [];

let timer: any = null;

const group_ = ['所有队伍', '关注队伍'];
const fgroup_ = ['all', 'concerned'];

let menu_item = {
    type: ['排行榜', '统计分析'],
    group: ['所有队伍', '关注队伍'],
};

let fgroup = ['all', 'concerned'];

const head_item = [
    <table>
        <tbody>
            <tr>
                <td className="gold">Gold</td>
                <td className="silver">Silver</td>
                <td className="bronze">Bronze</td>
                <td className="honorable">Honorable</td>
                <td className="unofficial">Unofficial</td>
                <td className="firstsolve">First to solve problem</td>
                <td className="correct">Solved problem</td>
                <td className="incorrect">Attempted problem</td>
                <td className="pending">Pending judgement</td>
            </tr>
        </tbody>
    </table>,
    <></>,
    <></>,
];

function getTimeFlag(contest_config: any) {
    let timeFlag = getNowTimeStamp();
    timeFlag = Math.max(timeFlag, contest_config.start_time);
    timeFlag = Math.min(timeFlag, contest_config.end_time);
    return Math.ceil(timeFlag - contest_config.start_time);
}

function getGroup(search: any) {
    let group = 'all';
    const params = new URLSearchParams(search);
    if (params.get('group')) {
        const index = menu_item.group.indexOf(params.get('group') || '');
        if (index !== -1) {
            group = fgroup[index];
        }
    }
    return group;
}

async function update(_this: Board) {
    contest_config = await getJSON(
        [pathname, `config.json?t=${getNowTimeStamp()}`].join('/'),
    );
    team = await getJSON(
        [pathname, `team.json?t=${getNowTimeStamp()}`].join('/'),
    );
    run = await getJSON(
        [pathname, `run.json?t=${getNowTimeStamp()}`].join('/'),
    );
    if (!contest_config.contest_name) {
        return;
    }
    if (contest_config.group) {
        let _group = deepCopy(group_);
        let _fgroup: any = deepCopy(fgroup_);
        for (let k in contest_config.group) {
            let v = contest_config.group[k];
            _fgroup.push(k);
            _group.push(v);
            menu_item.group = _group;
            fgroup = _fgroup;
        }
    } else {
        menu_item.group = deepCopy(group_);
        fgroup = deepCopy(fgroup_);
    }
    const timeFlag = getTimeFlag(contest_config);
    for (let team_id in team) {
        team[team_id]['all'] = 1;
    }

    const params = new URLSearchParams(_this.props.location.search);
    let menu_index: any = {};
    for (let key in menu_item) {
        if (params.get(key)) {
            menu_index[key] = menu_item[key].indexOf(params.get(key));
            if (menu_index[key] === -1) menu_index[key] = 0;
        } else {
            menu_index[key] = 0;
        }
    }

    _this.setState({
        contest_config: contest_config,
        team: team,
        run: run,
        timeFlag: timeFlag,
        menu_index: menu_index,
        loaded: true,
    });
    document.title = contest_config.contest_name;
    timer && clearTimeout(timer);
    timer = setTimeout(() => {
        update(_this);
    }, 30000);
}

function getSchool(team: any) {
    let school: any = [];
    for (let team_id in team) {
        if (team[team_id].school) {
            school.push(team[team_id].school);
        }
    }
    return removeDuplicateItems(school);
}

function getCurrentSchool(search: any) {
    let params = new URLSearchParams(search);
    if (params.get('school')) {
        return JSON.parse(params.get('school') || '');
    }
    return [];
}

function getRun(run: any, team: any, timeFlag: any, group: any, search: any) {
    let new_run: any = [];
    run.forEach((item: any) => {
        if (item.timestamp <= timeFlag) {
            new_run.push(item);
        }
    });
    new_run.sort((a: any, b: any) => {
        if (a.timestamp < b.timestamp) return -1;
        if (a.timestamp > b.timestamp) return 1;
        return 0;
    });
    let dic: any = {};
    run = [];
    let school = getCurrentSchool(search);
    if (school.length === 0) school = getSchool(team);
    new_run.forEach((item: any) => {
        if (
            team[item.team_id][group] === 1 &&
            (!team[item.team_id].school ||
                school.indexOf(team[item.team_id].school) !== -1)
        ) {
            const id = [item.team_id, item.problem_id].join('-');
            if (!dic[id] || item.timestamp <= dic[id]) {
                run.push(item);
                if (item.status === 'correct') {
                    dic[id] = item.timestamp;
                } else {
                    dic[id] = INF;
                }
            }
        }
    });
    return run;
}

function getTeam(team: any, group: any, search: any) {
    let school = getCurrentSchool(search);
    if (school.length === 0) school = getSchool(team);
    let team_list: any = {};
    for (let team_id in team) {
        let item = team[team_id];
        if (window.localStorage.getItem(getStarKey(team_id))) {
            item.concerned = 1;
        }
        if (
            item[group] === 1 &&
            (!item.school || school.indexOf(item.school) !== -1)
        ) {
            team_list[team_id] = item;
        }
    }
    return team_list;
}

function getConfig(contest_config: any, group: any) {
    let config = deepCopy(contest_config);
    if (config.medal) {
        delete config.medal;
        if (contest_config.medal[group])
            config.medal = deepCopy(contest_config.medal[group]);
    }
    return config;
}

class Board extends React.Component {
    componentDidMount() {
        pathname = window.location.pathname;
        update(this);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        timer && clearTimeout(timer);
    }

    //props中的值发生改变时执行
    async componentWillReceiveProps(nextProps: any) {
        update(this);
    }

    constructor(props: any) {
        super(props);
    }

    state = {
        contest_config: {},
        team: {},
        run: [],
        timeFlag: 0,
        loaded: false,
        menu_index: {
            type: 0,
            group: 0,
        },
        tab: 0,
    };

    render() {
        return (
            <div className={style.root}>
                {this.state.loaded === false && (
                    <div className={style.loading}>
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <>
                        <div className={style.title}>
                            {this.state.contest_config.contest_name}
                        </div>

                        <Progress
                            head_item={head_item[this.state.menu_index.type]}
                            start_time={this.state.contest_config.start_time}
                            end_time={this.state.contest_config.end_time}
                            frozen_time={this.state.contest_config.frozen_time}
                        />

                        <br />

                        <div style={{ display: 'flex' }}>
                            <div style={{ float: 'left' }}>
                                <SecondLevelMenu
                                    params={
                                        new URLSearchParams(
                                            this.props.location.search,
                                        )
                                    }
                                    history={this.props.history}
                                    queryName={'group'}
                                    siderItem={menu_item.group}
                                    currentItem={
                                        menu_item.group[
                                            this.state.menu_index.group
                                        ]
                                    }
                                />
                            </div>
                            {this.state.contest_config.school && (
                                <div style={{ flex: '1', maxWidth: '480px' }}>
                                    <Selected
                                        placeholder={'School Filter'}
                                        params={
                                            new URLSearchParams(
                                                this.props.location.search,
                                            )
                                        }
                                        history={this.props.history}
                                        queryName={'school'}
                                        selectedItem={getSchool(
                                            this.state.team,
                                        )}
                                        currentSelected={getCurrentSchool(
                                            this.props.location.search,
                                        )}
                                    />
                                </div>
                            )}
                            <div style={{ flex: '1' }}></div>
                            <div style={{ float: 'right' }}>
                                <SecondLevelMenu
                                    params={
                                        new URLSearchParams(
                                            this.props.location.search,
                                        )
                                    }
                                    history={this.props.history}
                                    queryName={'type'}
                                    siderItem={menu_item.type.slice().reverse()}
                                    currentItem={
                                        menu_item.type[
                                            this.state.menu_index.type
                                        ]
                                    }
                                />
                            </div>
                        </div>

                        {this.state.menu_index.type === 0 && (
                            <Standings
                                contest_config={getConfig(
                                    this.state.contest_config,
                                    getGroup(this.props.location.search),
                                )}
                                team={getTeam(
                                    this.state.team,
                                    getGroup(this.props.location.search),
                                    this.props.location.search,
                                )}
                                run={getRun(
                                    this.state.run,
                                    this.state.team,
                                    this.state.timeFlag,
                                    getGroup(this.props.location.search),
                                    this.props.location.search,
                                )}
                                timeFlag={this.state.timeFlag}
                            />
                        )}

                        {this.state.menu_index.type === 1 && (
                            <Statistics
                                contest_config={getConfig(
                                    this.state.contest_config,
                                    getGroup(this.props.location.search),
                                )}
                                team={getTeam(
                                    this.state.team,
                                    getGroup(this.props.location.search),
                                    this.props.location.search,
                                )}
                                run={getRun(
                                    this.state.run,
                                    this.state.team,
                                    this.state.timeFlag,
                                    getGroup(this.props.location.search),
                                    this.props.location.search,
                                )}
                                timeFlag={this.state.timeFlag}
                            />
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default Board;
