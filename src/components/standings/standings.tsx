import React from 'react';
import './standings.css';
import Placecharts from './placecharts';

const options: Highcharts.Options = {
    title: {
        text: '排名变化趋势',
    },
    series: [
        {
            type: 'line',
            data: [1, 2, 3],
        },
    ],
    credits: {
        enabled: false,
    },
};

const INF = 0x3f3f3f3f;

function get_analyze_team_id(index: number) {
    return ['analyze', 'team', index].join('-');
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

function getInitProblem(contest_config: any) {
    let problem_list: any = [];
    contest_config.problem_id.forEach((id: CharacterData, index: number) => {
        let item: any = {};
        item['problem_id'] = index;
        item['solved'] = 0;
        item['total'] = 0;
        item['first_solve_time'] = INF;
        item['last_solve_time'] = 0;
        problem_list.push(item);
    });
    return problem_list;
}

function getInitTeam(contest_config: any, team: any) {
    let team_dic: any = {};
    for (let key in team) {
        let item = team[key];
        let new_item: any = {};
        for (let k in item) {
            new_item[k] = item[k];
        }
        new_item['solved'] = 0;
        new_item['time'] = 0;
        new_item['problem'] = [];
        contest_config.problem_id.forEach(
            (id: CharacterData, index: number) => {
                let problem: any = {};
                problem['time'] = 0;
                problem['status'] = 'unattempted';
                problem['attempt_num'] = 0;
                new_item.problem.push(problem);
            },
        );
        team_dic[key] = new_item;
    }
    return team_dic;
}

function gao_problem(contest_config: any, run: any) {
    let problem_list = getInitProblem(contest_config);
    run.forEach((run: any) => {
        let problem = problem_list[run.problem_id];
        problem.total += 1;
        if (run.status === 'correct') {
            problem.solved += 1;
            problem.first_solve_time = Math.min(
                problem.first_solve_time,
                Math.floor(run.timestamp / 60),
            );
            problem.last_solve_time = Math.max(
                problem.last_solve_time,
                Math.floor(run.timestamp / 60),
            );
        }
    });
    return problem_list;
}

function gao_team(contest_config: any, team: any, run: any, problem_list: any) {
    let team_dic: any = getInitTeam(contest_config, team);
    let team_list: any = [];

    run.forEach((run: any) => {
        let team_id = run.team_id;
        let problem_id = run.problem_id;
        let team = team_dic[team_id];
        let problem = team.problem[problem_id];
        problem.attempt_num += 1;
        problem.time = Math.floor(run.timestamp / 60);
        if (run.status === 'correct') {
            problem.status = 'correct';
            team.solved += 1;
            team.time +=
                problem.time +
                (problem.attempt_num - 1) *
                    Math.floor(contest_config.penalty / 60);
        } else if (run.status === 'pending') {
            problem.status = 'pending';
        } else if (run.status === 'incorrect') {
            problem.status = 'incorrect';
        }
    });

    for (let k in team_dic) {
        team_dic[k]['team_id'] = k;
        team_list.push(team_dic[k]);
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
            pre_solved = contest_config.problem_id.length + 1;
        i < team_list.length;
        ++i
    ) {
        let item = team_list[i];
        if (item.unofficial) {
            item.place = '*';
            unofficial += 1;
            item.place_className = contest_config.medal ? 'unofficial' : 'stnd';
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
        if (contest_config.medal) {
            let tot = 0;
            let ok = false;
            const medal = contest_config.medal;
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
        } else {
            item.place_className = 'stnd';
        }
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
        for (let j = 0; j < contest_config.problem_id.length; ++j) {
            let problem = item.problem[j];
            problem.status_className = problem.status;
            if (
                problem.status === 'correct' &&
                problem.time === problem_list[j].first_solve_time
            ) {
                problem.status_className = 'firstsolve';
            }
        }
    }

    if (contest_config.school) {
        let school_dic: any = {};
        for (let i = 0; i < team_list.length; ++i) {
            let team = team_list[i];
            if (team.unofficial) continue;
            if (school_dic[team.school] === 1) continue;
            team.school_place = Object.keys(school_dic).length + 1;
            school_dic[team.school] = 1;
        }
    }

    return team_list;
}

class Standings extends React.Component {
    contest_config: any = {};
    team: any = {};
    run: any = [];
    timeFlag: number = 0;
    vis: any = {};

    update(props: any) {
        this.contest_config = props.contest_config;
        this.team = props.team;
        this.run = props.run;
        this.timeFlag = props.timeFlag;
        this.run = getRun(this.run, this.timeFlag);

        let problem_list = gao_problem(this.contest_config, this.run);
        let team_list = gao_team(
            this.contest_config,
            this.team,
            this.run,
            problem_list,
        );

        this.setState({
            problem_list: problem_list,
            team_list: team_list,
            contest_config: this.contest_config,
            team: this.team,
            run: this.run,
            school: this.contest_config.school.name || 0,
        });
    }

    getInfoCol() {
        return 4 + this.state.school;
    }

    getProblemCol() {
        return this.contest_config.problem_id.length;
    }

    componentDidMount() {
        this.update(this.props);
    }

    //props中的值发生改变时执行
    componentWillReceiveProps(nextProps: any) {
        if (
            this.props.contest_config !== nextProps.contest_config ||
            this.props.team !== nextProps.team ||
            this.props.run !== nextProps.run
        ) {
            this.update(nextProps);
        }
    }

    constructor(props: any) {
        super(props);
    }

    state = {
        contest_config: {},
        team: {},
        run: [],
        problem_list: [],
        team_list: [],
        school: 0,
        vis: {},
    };

    render() {
        return (
            <table className="standings">
                <tbody>
                    <tr>
                        <th className="title" style={{ width: '4em' }}>
                            Place
                        </th>
                        {this.state.school === 1 && (
                            <th className="title" style={{ width: '18em' }}>
                                School
                            </th>
                        )}
                        <th className="title">Team</th>
                        <th className="title" style={{ width: '4em' }}>
                            Solved
                        </th>
                        <th className="title" style={{ width: '4em' }}>
                            Time
                        </th>
                        {this.state.problem_list.map((item: any) => {
                            return (
                                <th
                                    className="success"
                                    style={{ width: '4em' }}
                                >
                                    {[
                                        this.state.contest_config.problem_id[
                                            item.problem_id
                                        ],
                                    ]}
                                    <br />
                                    <s>
                                        {item.solved}/{item.total}
                                    </s>
                                </th>
                            );
                        })}
                    </tr>

                    {this.state.team_list.map((item: any, index: number) => {
                        return (
                            <>
                                <tr
                                    className={[
                                        ['stand', item.stand_className_id].join(
                                            '',
                                        ),
                                        'team',
                                    ].join(' ')}
                                    onClick={() => {
                                        let item = document.getElementById(
                                            get_analyze_team_id(index),
                                        );
                                        if (item?.style.display === 'none') {
                                            item.style.display = '';
                                            if (
                                                !this.vis[
                                                    get_analyze_team_id(index)
                                                ]
                                            ) {
                                                this.vis[
                                                    get_analyze_team_id(index)
                                                ] = 1;
                                                this.setState({
                                                    vis: this.vis,
                                                });
                                            }
                                        } else if (item?.style.display === '') {
                                            item.style.display = 'none';
                                        }
                                    }}
                                >
                                    <td className={item.place_className}>
                                        {item.place}
                                    </td>
                                    {this.state.school === 1 && (
                                        <td className="stnd">
                                            <div style={{ display: 'flex' }}>
                                                <div
                                                    style={{
                                                        float: 'left',
                                                        fontFamily: 'Georgia',
                                                        paddingLeft: 5,
                                                    }}
                                                >
                                                    {item.school_place}
                                                </div>
                                                <div style={{ flex: '1' }}>
                                                    {item.school}
                                                </div>
                                                <div
                                                    style={{ float: 'right' }}
                                                ></div>
                                            </div>
                                        </td>
                                    )}
                                    <td className="stnd">{item.name}</td>
                                    <td className="stnd">{item.solved}</td>
                                    <td className="stnd">{item.time}</td>
                                    {item.problem.map((item: any) => {
                                        let ch_status = '-';
                                        if (item.status === 'correct')
                                            ch_status = '+';
                                        if (item.status === 'incorrect')
                                            ch_status = '-';
                                        if (item.status === 'pending')
                                            ch_status = '?';
                                        if (item.status === 'unattempted')
                                            ch_status = '.';
                                        return (
                                            <td
                                                className={
                                                    item.status_className
                                                }
                                            >
                                                {ch_status}
                                                <br />
                                                {item.attempt_num
                                                    ? parseInt(item.attempt_num)
                                                    : ''}
                                                {this.state.contest_config
                                                    .status_time[
                                                    item.status
                                                ] === 1 && item.time
                                                    ? '/' + parseInt(item.time)
                                                    : ''}
                                            </td>
                                        );
                                    })}
                                </tr>
                                <tr
                                    style={{ display: 'none' }}
                                    id={get_analyze_team_id(index)}
                                >
                                    <td
                                        colSpan={
                                            this.getInfoCol() +
                                            this.getProblemCol()
                                        }
                                    >
                                        {this.state.vis[
                                            get_analyze_team_id(index)
                                        ] === 1 && (
                                            <>
                                                <Placecharts
                                                    contest_config={
                                                        this.state
                                                            .contest_config
                                                    }
                                                    cur_team={item}
                                                    team={this.state.team}
                                                    run={this.state.run}
                                                />
                                            </>
                                        )}
                                    </td>
                                </tr>
                            </>
                        );
                    })}

                    <tr className="statistics-0">
                        <td
                            className="empty"
                            colSpan={this.getInfoCol() - 1}
                        ></td>
                        <td className="stnd">
                            <b>Attempted:</b>
                        </td>
                        {this.state.problem_list.map((item: any) => {
                            return (
                                <td className="stnd">
                                    <b>{item.total}</b>
                                </td>
                            );
                        })}
                    </tr>

                    <tr className="statistics-1">
                        <td
                            className="empty"
                            colSpan={this.getInfoCol() - 1}
                        ></td>
                        <td className="stnd">
                            <b>Accepted:</b>
                        </td>
                        {this.state.problem_list.map((item: any) => {
                            return (
                                <td className="stnd">
                                    <b>{item.solved}</b>
                                    <br />
                                    <b>
                                        (
                                        {Math.round(
                                            (item.solved / item.total) * 100,
                                        )}
                                        {item.total === 0 ? '' : '%'})
                                    </b>
                                </td>
                            );
                        })}
                    </tr>

                    <tr className="statistics-0">
                        <td
                            className="empty"
                            colSpan={this.getInfoCol() - 1}
                        ></td>
                        <td className="stnd">
                            <b>First Solved:</b>
                        </td>
                        {this.state.problem_list.map((item: any) => {
                            return (
                                <td className="stnd">
                                    <b>
                                        {item.first_solve_time === INF
                                            ? 'N/A'
                                            : item.first_solve_time}
                                    </b>
                                </td>
                            );
                        })}
                    </tr>

                    <tr className="statistics-1">
                        <td
                            className="empty"
                            colSpan={this.getInfoCol() - 1}
                        ></td>
                        <td className="stnd">
                            <b>Last Solved:</b>
                        </td>
                        {this.state.problem_list.map((item: any) => {
                            return (
                                <td className="stnd">
                                    <b>
                                        {item.last_solve_time === 0
                                            ? 'N/A'
                                            : item.last_solve_time}
                                    </b>
                                </td>
                            );
                        })}
                    </tr>
                </tbody>
            </table>
        );
    }
}

export default Standings;
