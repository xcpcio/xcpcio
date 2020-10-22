import React from 'react';
import Loading from '@/components/Loading/Loading';
import { getJSON, getTimeDiff, getNowTimeStamp } from '@/utils/utils';
import Progress from '@/components/progress/progress';
import SecondLevelMenu from '@/components/second-level-menu/second-level-menu';
import Standings from '@/components/standings/standings';

let pathname = '';

let contest_config: any = {};
let team: any = {};
let run: any = [];

const left_second_menu = ['排行榜', '统计分析'];
// , '时间线', '统计分析'];
const right_second_menu = ['所有队伍'];
// , '关注队伍'];

function getTimeFlag(contest_config: any) {
    let timeFlag = getNowTimeStamp();
    timeFlag = Math.max(timeFlag, contest_config.start_time);
    timeFlag = Math.min(timeFlag, contest_config.end_time);
    return Math.ceil(timeFlag - contest_config.start_time);
}

let timer: any = null;

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

    _this.setState({
        contest_config: contest_config,
        team: team,
        run: run,
        timeFlag: timeFlag,
        loaded: true,
    });
    document.title = contest_config.contest_name;
    timer = setTimeout(() => {
        update(_this);
    }, 30000);
}

class Board extends React.Component {
    componentDidMount() {
        pathname = window.location.pathname;
        const params = new URLSearchParams(this.props.location.search);
        let query: any = {};
        for (const [key, value] of params) {
            query[key] = value;
        }
        this.props.history.push({
            pathname: pathname,
            query: query,
        });
        update(this);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        timer && clearInterval(timer);
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
        left_second_menu_index: 0,
        right_second_menu_index: 0,
        tab: 0,
    };

    render() {
        return (
            <div style={{ maxWidth: 1560 }}>
                {this.state.loaded === false && (
                    <div
                        style={{
                            height: 'calc(100vh - 50px)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Loading />
                    </div>
                )}

                {this.state.loaded && (
                    <>
                        <h1>{this.state.contest_config.contest_name}</h1>

                        <Progress
                            start_time={this.state.contest_config.start_time}
                            end_time={this.state.contest_config.end_time}
                            frozen_time={this.state.contest_config.frozen_time}
                        />

                        <br />

                        <div style={{ display: 'flex' }}>
                            <div style={{ float: 'left' }}>
                                <SecondLevelMenu
                                    siderItem={right_second_menu}
                                    currentItem={
                                        right_second_menu[
                                            this.state.right_second_menu_index
                                        ]
                                    }
                                />
                            </div>

                            <div style={{ flex: '1' }}></div>
                            <div style={{ float: 'right' }}>
                                <SecondLevelMenu
                                    siderItem={left_second_menu
                                        .slice()
                                        .reverse()}
                                    currentItem={
                                        left_second_menu[
                                            this.state.left_second_menu_index
                                        ]
                                    }
                                />
                            </div>
                        </div>

                        {this.state.tab === 0 && (
                            <Standings
                                contest_config={this.state.contest_config}
                                team={this.state.team}
                                run={this.state.run}
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
