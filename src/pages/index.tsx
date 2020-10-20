import React from 'react';
import './board.css';
import request from '@/utils/request';
import Loading from '@/components/Loading';

function getJSON(url: string) {
    return new Promise((resolve, reject) => {
        request.get(url).then((response: Response) => {
            resolve(response);
        });
    });
}

let pathname = '';
let problem_info: any = [];
let problem_id = [];
let medal = [];

let contest_config: any = {};
let team: any = {};
let result: any = {};
let run: any = {};
let team_list: any = [];

const INF = 0x3f3f3f3f;

async function update(_this: Board) {
    contest_config = await getJSON([pathname, 'config.json'].join('/'));
    team = await getJSON([pathname, 'team.json'].join('/'));
    // console.log(contest_config);
    problem_id = contest_config.problem_id;
    medal = contest_config.medal;

    if (!problem_id) {
        return;
    }

    problem_id.map((id: CharacterData) => {
        problem_info.push({});
        let item = problem_info[problem_info.length - 1];
        item['problem_id'] = id;
        item['solved'] = 0;
        item['total'] = 0;
        item['firstsolve_time'] = INF;
        item['lastsolve_time'] = 0;
    });

    if (contest_config.result_mode) {
        result = await getJSON([pathname, 'result.json'].join('/'));
        for (let key in result) {
            const item = result[key];
            team[key]['solved'] = item.solved;
            team[key]['time'] = item.time;
            team[key]['detail'] = item.detail;
            team_list.push(team[key]);
            for (let i = 0; i < problem_id.length; ++i) {
                const p_item = item.detail[i];
                if (p_item['attempt_num']) {
                    problem_info[i].total += parseInt(p_item['attempt_num']);
                }
                if (p_item.status === 'correct') {
                    problem_info[i].solved += 1;
                    problem_info[i]['firstsolve_time'] = Math.min(
                        problem_info[i]['firstsolve_time'],
                        parseInt(p_item.time),
                    );
                    problem_info[i]['lastsolve_time'] = Math.max(
                        problem_info[i]['lastsolve_time'],
                        parseInt(p_item.time),
                    );
                }
            }
        }
    }

    if (contest_config.run_mode) {
        run = await getJSON([pathname, 'run.json'].join('/'));
    }

    team_list.sort((a: any, b: any) => {
        if (a.solved != b.solved) {
            if (a.solved > b.solved) return -1;
            if (a.solved < b.solved) return 1;
        }
        if (a.time !== b.time) {
            if (a.time < b.time) return -1;
            if (a.time > b.time) return 1;
        }
        return 0;
    });

    for (
        let i = 0,
            unofficial = 0,
            pre_place = 0,
            pre_time = -1,
            pre_solved = problem_id.length + 1;
        i < team_list.length;
        ++i
    ) {
        let item = team_list[i];
        if (item.unofficial) {
            item.place = '*';
            unofficial += 1;
            item.place_className = 'unofficial';
            continue;
        }
        if (item.solved == pre_solved && item.time == pre_time) {
            item.place = pre_place;
        } else {
            item.place = i + 1 - unofficial;
            pre_place = item.place;
            pre_time = item.time;
            pre_solved = item.solved;
        }
        let tot = 0;
        let ok = false;
        [
            { gold: medal.gold },
            { silver: medal.silver },
            { bronze: medal.bronze },
            { honorable: INF },
        ].forEach((medal: any) => {
            for (let key in medal) {
                tot += medal[key];
                if (item.place <= tot && !ok) {
                    item.place_className = key;
                    ok = true;
                }
            }
        });
    }

    for (let i = 0; i < team_list.length; ++i) {
        let item = team_list[i];
        if (i == 0) {
            item.stand_className_id = 0;
        } else {
            const pre_item = team_list[i - 1];
            if (item.solved == pre_item.solved) {
                item.stand_className_id = pre_item.stand_className_id ^ 1;
            } else {
                const id = pre_item.stand_className_id;
                item.stand_className_id =
                    (Math.floor(id / 10) ^ 1) * 10 + (id % 10);
            }
        }
        for (let j = 0; j < problem_id.length; ++j) {
            let problem = item.detail[j];
            if (
                problem.status === 'correct' &&
                problem.time === problem_info[j].firstsolve_time
            ) {
                problem.status = 'firstsolve';
            }
        }
    }

    _this.setState({
        contest_name: contest_config.contest_name,
        problem_info: problem_info,
        team_list: team_list,
        loaded: true,
    });
    document.title = contest_config.contest_name;
}

class Board extends React.Component {
    componentDidMount() {
        pathname = window.location.pathname;
        update(this);
    }

    constructor(props: any) {
        super(props);
    }

    state = {
        contest_name: '',
        problem_info: [],
        team_list: [],
        loaded: false,
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
                        <h1>{this.state.contest_name}</h1>

                        <div style={{ float: 'left' }}>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="gold">Gold</td>
                                        <td className="silver">Silver</td>
                                        <td className="bronze">Bronze</td>
                                        <td className="honorable">Honorable</td>
                                        <td className="unofficial">
                                            Unofficial
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style={{ float: 'right' }}>
                            <table>
                                <tbody>
                                    <tr>
                                        <td className="firstsolve">
                                            First to solve problem
                                        </td>
                                        <td className="correct">
                                            Solved problem
                                        </td>
                                        <td className="incorrect">
                                            Attempted problem
                                        </td>
                                        <td className="pending">
                                            Pending judgement
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <br />

                        <table className="standings">
                            <tbody>
                                <tr>
                                    <th
                                        className="stnd"
                                        style={{ width: '4em' }}
                                    >
                                        Place
                                    </th>
                                    <th
                                        className="stnd"
                                        style={{ width: '15%' }}
                                    >
                                        School
                                    </th>
                                    <th
                                        className="stnd"
                                        style={{ width: '35%' }}
                                    >
                                        Team
                                    </th>
                                    <th
                                        className="stnd"
                                        style={{ width: '4em' }}
                                    >
                                        Solved
                                    </th>
                                    <th
                                        className="stnd"
                                        style={{ width: '4em' }}
                                    >
                                        Time
                                    </th>
                                    {this.state.problem_info.map(
                                        (item: any) => {
                                            return (
                                                <th
                                                    className="success"
                                                    style={{ width: '4em' }}
                                                >
                                                    {item.problem_id}
                                                    <br />
                                                    <s>
                                                        {item.solved}/
                                                        {item.total}
                                                    </s>
                                                </th>
                                            );
                                        },
                                    )}
                                </tr>

                                {this.state.team_list.map((item: any) => {
                                    return (
                                        <tr
                                            className={[
                                                'stand',
                                                item.stand_className_id,
                                            ].join('')}
                                        >
                                            <td
                                                className={item.place_className}
                                            >
                                                {item.place}
                                            </td>
                                            <td className="stnd">
                                                {item.school}
                                            </td>
                                            <td className="stnd">
                                                {item.name}
                                            </td>
                                            <td className="stnd">
                                                {item.solved}
                                            </td>
                                            <td className="stnd">
                                                {item.time}
                                            </td>
                                            {item.detail.map((item: any) => {
                                                let ch_status = '-';
                                                if (
                                                    item.status === 'correct' ||
                                                    item.status === 'firstsolve'
                                                )
                                                    ch_status = '+';
                                                if (item.status === 'incorrect')
                                                    ch_status = '-';
                                                if (item.status === 'pending')
                                                    ch_status = '?';
                                                if (
                                                    item.status ===
                                                    'unattempted'
                                                )
                                                    ch_status = '.';
                                                return (
                                                    <td className={item.status}>
                                                        {ch_status}
                                                        <br />
                                                        {item.attempt_num
                                                            ? parseInt(
                                                                  item.attempt_num,
                                                              )
                                                            : ''}
                                                        {item.time
                                                            ? '/' +
                                                              parseInt(
                                                                  item.time,
                                                              )
                                                            : ''}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}

                                <tr className="statistics-0">
                                    <td className="empty" colSpan={4}></td>
                                    <td className="stnd">
                                        <b>Attempted:</b>
                                    </td>
                                    {this.state.problem_info.map(
                                        (item: any) => {
                                            return (
                                                <td className="stnd">
                                                    <b>{item.total}</b>
                                                </td>
                                            );
                                        },
                                    )}
                                </tr>

                                <tr className="statistics-1">
                                    <td className="empty" colSpan={4}></td>
                                    <td className="stnd">
                                        <b>Accepted:</b>
                                    </td>
                                    {this.state.problem_info.map(
                                        (item: any) => {
                                            return (
                                                <td className="stnd">
                                                    <b>{item.solved}</b>
                                                    <br />
                                                    <b>
                                                        (
                                                        {Math.round(
                                                            (item.solved /
                                                                item.total) *
                                                                100,
                                                        )}
                                                        {item.total === 0
                                                            ? ''
                                                            : '%'}
                                                        )
                                                    </b>
                                                </td>
                                            );
                                        },
                                    )}
                                </tr>

                                <tr className="statistics-0">
                                    <td className="empty" colSpan={4}></td>
                                    <td className="stnd">
                                        <b>First Solved:</b>
                                    </td>
                                    {this.state.problem_info.map(
                                        (item: any) => {
                                            return (
                                                <td className="stnd">
                                                    <b>
                                                        {item.firstsolve_time ===
                                                        INF
                                                            ? 'N/A'
                                                            : item.firstsolve_time}
                                                    </b>
                                                </td>
                                            );
                                        },
                                    )}
                                </tr>

                                <tr className="statistics-1">
                                    <td className="empty" colSpan={4}></td>
                                    <td className="stnd">
                                        <b>Last Solved:</b>
                                    </td>
                                    {this.state.problem_info.map(
                                        (item: any) => {
                                            return (
                                                <td className="stnd">
                                                    <b>
                                                        {item.lastsolve_time ===
                                                        0
                                                            ? 'N/A'
                                                            : item.lastsolve_time}
                                                    </b>
                                                </td>
                                            );
                                        },
                                    )}
                                </tr>
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        );
    }
}

export default Board;
