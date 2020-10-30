import React from 'react';
import { Loading } from '@/components/Loading';
import { ProgressBig } from '@/components/Progress';
import { SecondLevelMenu } from '@/components/SecondLevelMenu';
import { Standings } from '@/components/Standings';
import { Statistics } from '@/components/Statistics';
import { Selected } from '@/components/Selected';
import standingsStyle from '@/components/Standings/Standings.less';
import {
    getNowTimeStamp,
    deepCopy,
    getStarKey,
    removeDuplicateItems,
} from '@/utils';
import style from './board.less';
import {
    fetchData,
    getMenu,
    getCurrentGroup,
    getTimeFlag,
    getOrganization,
    getCurrentOrganization,
} from './model';

const head_item = [
    <table>
        <tbody>
            <tr>
                <td className={standingsStyle.gold}>Gold</td>
                <td className={standingsStyle.silver}>Silver</td>
                <td className={standingsStyle.bronze}>Bronze</td>
                <td className={standingsStyle.honorable}>Honorable</td>
                <td className={standingsStyle.unofficial}>Unofficial</td>
                <td className={standingsStyle.firstsolve}>
                    First to solve problem
                </td>
                <td className={standingsStyle.correct}>Solved problem</td>
                <td className={standingsStyle.incorrect}>Attempted problem</td>
                <td className={standingsStyle.pending}>Pending judgement</td>
            </tr>
        </tbody>
    </table>,
    <></>,
    <></>,
];

const INF = 0x3f3f3f3f;

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
    let organization = getCurrentOrganization(search);
    if (organization.length === 0) organization = getOrganization(team);
    new_run.forEach((item: any) => {
        if (
            team[item.team_id][group] === 1 &&
            (!team[item.team_id].organization ||
                organization.indexOf(team[item.team_id].organization) !== -1)
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
    let organization = getCurrentOrganization(search);
    if (organization.length === 0) organization = getOrganization(team);
    let team_list: any = {};
    for (let team_id in team) {
        let item = team[team_id];
        if (window.localStorage.getItem(getStarKey(team_id))) {
            item.concerned = 1;
        }
        if (
            item[group] === 1 &&
            (!item.organization ||
                organization.indexOf(item.organization) !== -1)
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
    timer: any = null;

    async update(props: any) {
        let { contest_config, team, run } = await fetchData();

        if (contest_config === null || team === null || run === null) {
            this.timer && clearTimeout(this.timer);
            this.timer = setTimeout(() => {
                this.update(props);
            }, 1000);
            return;
        }

        document.title = contest_config.contest_name;

        for (let team_id in team) {
            team[team_id]['all'] = 1;
        }

        let { menu_item, fgroup } = getMenu(contest_config);

        let menu_index = (() => {
            let menu_index: any = {};
            const params = new URLSearchParams(props.location.search);
            for (let key in menu_item) {
                if (params.get(key)) {
                    menu_index[key] = menu_item[key].indexOf(params.get(key));
                    if (menu_index[key] === -1) menu_index[key] = 0;
                } else {
                    menu_index[key] = 0;
                }
            }
            return menu_index;
        })();

        this.setState({
            contest_config: contest_config,
            team: team,
            run: run,
            timeFlag: getTimeFlag(contest_config),
            menu_item: menu_item,
            fgroup: fgroup,
            menu_index: menu_index,
            loaded: true,
        });

        this.timer && clearTimeout(this.timer);
        this.timer = setTimeout(() => {
            this.update(props);
        }, 30000);
    }

    componentDidMount() {
        this.update(this.props);
    }

    //props中的值发生改变时执行
    componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    constructor(props: any) {
        super(props);
    }

    state = {
        contest_config: {},
        team: {},
        run: [],
        current_contest_config: {},
        current_team: {},
        current_run: [],
        timeFlag: 0,
        loaded: false,
        menu_item: {},
        fgroup: [],
        menu_index: {
            type: 0,
            group: 0,
        },
        tab: 0,
        Filter: false,
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
                            {this.state.contest_config?.contest_name}
                        </div>

                        <ProgressBig
                            head_item={head_item[this.state.menu_index.type]}
                            start_time={this.state.contest_config?.start_time}
                            end_time={this.state.contest_config?.end_time}
                            frozen_time={this.state.contest_config?.frozen_time}
                        />

                        <br />

                        <div style={{ display: 'flex' }}>
                            <div style={{ float: 'left' }}>
                                <SecondLevelMenu
                                    search={this.props.location.search}
                                    history={this.props.history}
                                    queryName={'group'}
                                    siderItem={this.state.menu_item.group}
                                    currentItem={
                                        this.state.menu_item.group[
                                            this.state.menu_index.group
                                        ]
                                    }
                                />
                            </div>

                            {this.state.contest_config?.organization && (
                                <div style={{ flex: '1', maxWidth: '480px' }}>
                                    <Selected
                                        placeholder={[
                                            this.state.contest_config
                                                .organization,
                                            'Filter',
                                        ].join(' ')}
                                        search={this.props.location.search}
                                        history={this.props.history}
                                        queryName={'organization'}
                                        selectedItem={getOrganization(
                                            this.state.team,
                                        )}
                                        currentSelected={getCurrentOrganization(
                                            this.props.location.search,
                                        )}
                                    />
                                </div>
                            )}

                            <div style={{ flex: '1' }}></div>
                            <div style={{ float: 'right' }}>
                                <SecondLevelMenu
                                    search={this.props.location.search}
                                    history={this.props.history}
                                    queryName={'type'}
                                    siderItem={this.state.menu_item.type
                                        .slice()
                                        .reverse()}
                                    currentItem={
                                        this.state.menu_item.type[
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
                                    getCurrentGroup(
                                        this.props.location.search,
                                        this.state.menu_item.group,
                                        this.state.fgroup,
                                    ),
                                )}
                                team={getTeam(
                                    this.state.team,
                                    getCurrentGroup(
                                        this.props.location.search,
                                        this.state.menu_item.group,
                                        this.state.fgroup,
                                    ),
                                    this.props.location.search,
                                )}
                                run={getRun(
                                    this.state.run,
                                    this.state.team,
                                    this.state.timeFlag,
                                    getCurrentGroup(
                                        this.props.location.search,
                                        this.state.menu_item.group,
                                        this.state.fgroup,
                                    ),
                                    this.props.location.search,
                                )}
                                Filter={this.state.Filter}
                            />
                        )}

                        {this.state.menu_index.type === 1 && (
                            <Statistics
                                contest_config={getConfig(
                                    this.state.contest_config,
                                    getCurrentGroup(
                                        this.props.location.search,
                                        this.state.menu_item.group,
                                        this.state.fgroup,
                                    ),
                                )}
                                team={getTeam(
                                    this.state.team,
                                    getCurrentGroup(
                                        this.props.location.search,
                                        this.state.menu_item.group,
                                        this.state.fgroup,
                                    ),
                                    this.props.location.search,
                                )}
                                run={getRun(
                                    this.state.run,
                                    this.state.team,
                                    this.state.timeFlag,
                                    getCurrentGroup(
                                        this.props.location.search,
                                        this.state.menu_item.group,
                                        this.state.fgroup,
                                    ),
                                    this.props.location.search,
                                )}
                            />
                        )}
                    </>
                )}
            </div>
        );
    }
}

export default Board;
