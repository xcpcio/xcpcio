import React from 'react';
import Loading from '@/components/Loading/Loading';
import { getJSON, getTimeDiff, getNowTimeStamp } from '@/utils/utils';
import Progress from '@/components/progress/progress';
import SecondLevelMenu from '@/components/second-level-menu/second-level-menu';
import Standings from '@/components/standings/standings';
import Statistics from '@/components/Statistics/statistics';

const INF = 0x3f3f3f3f;
let pathname = '';

let contest_config: any = {};
let team: any = {};
let run: any = [];

let timer: any = null;

const menu_item = {
    type: ['排行榜', '统计分析'],
    group: ['所有队伍'],
};

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
    const timeFlag = getTimeFlag(contest_config);

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
    timer = setTimeout(() => {
        update(_this);
    }, 30000);
}

function getRun(run: any, timeFlag: any) {
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
    new_run.forEach((item: any) => {
        const id = [item.team_id, item.problem_id].join('-');
        if (!dic[id] || item.timestamp <= dic[id]) {
            run.push(item);
            if (item.status === 'correct') {
                dic[id] = item.timestamp;
            } else {
                dic[id] = INF;
            }
        }
    });
    return run;
}

class Board extends React.Component {
    componentDidMount() {
        pathname = window.location.pathname;
        update(this);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        timer && clearInterval(timer);
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
            <div style={{ maxWidth: 1560 }}>
                {this.state.loaded === false && (
                    // <></>
                    <div
                        style={{
                            height: 'calc(20vh)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <>
                        <h1>{this.state.contest_config.contest_name}</h1>

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
                                contest_config={this.state.contest_config}
                                team={this.state.team}
                                run={getRun(
                                    this.state.run,
                                    this.state.timeFlag,
                                )}
                                timeFlag={this.state.timeFlag}
                            />
                        )}

                        {this.state.menu_index.type === 1 && (
                            <Statistics
                                contest_config={this.state.contest_config}
                                team={this.state.team}
                                run={getRun(
                                    this.state.run,
                                    this.state.timeFlag,
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
