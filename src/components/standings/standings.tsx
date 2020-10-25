import React from 'react';
import './standings.css';
import './star.css';
import Placecharts from './placecharts';
import Loading from '@/components/Loading/Loading';
import { getStarKey } from '@/utils/utils';

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
            loaded: true,
        });
    }

    getInfoCol() {
        return 4 + this.state.school;
    }

    getProblemCol() {
        return this.contest_config.problem_id.length;
    }

    componentDidMount() {}

    //props中的值发生改变时执行
    componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    constructor(props: any) {
        super(props);
        setTimeout(() => {
            this.update(this.props);
        }, 500);
    }

    state = {
        contest_config: {},
        team: {},
        run: [],
        problem_list: [],
        team_list: [],
        school: 0,
        vis: {},
        loaded: false,
    };

    render() {
        return (
            <>
                {this.state.loaded === false && (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            height: 'calc(80vh)',
                        }}
                    >
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <table style={{ marginTop: '5px' }} className="standings">
                        <tbody>
                            <tr>
                                <th className="title" style={{ width: '3em' }}>
                                    Place
                                </th>
                                {this.state.school === 1 && (
                                    <th
                                        className="title"
                                        style={{ minWidth: '12em' }}
                                    >
                                        School
                                    </th>
                                )}
                                <th
                                    className="title"
                                    style={{ minWidth: '12em' }}
                                >
                                    Team
                                </th>
                                <th className="title" style={{ width: '3em' }}>
                                    Solved
                                </th>
                                <th className="title" style={{ width: '3em' }}>
                                    Time
                                </th>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <th
                                            className="success"
                                            style={{ width: '4em' }}
                                        >
                                            {[
                                                this.state.contest_config
                                                    .problem_id[
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

                            {this.state.team_list.map(
                                (item: any, index: number) => {
                                    return (
                                        <>
                                            <tr
                                                className={[
                                                    [
                                                        'stand',
                                                        item.stand_className_id,
                                                    ].join(''),
                                                    'team',
                                                ].join(' ')}
                                                onClick={() => {
                                                    let item = document.getElementById(
                                                        get_analyze_team_id(
                                                            index,
                                                        ),
                                                    );
                                                    if (
                                                        item?.style.display ===
                                                        'none'
                                                    ) {
                                                        for (let key in this
                                                            .vis) {
                                                            let item = document.getElementById(
                                                                key,
                                                            );
                                                            if (
                                                                item?.style
                                                                    .display ===
                                                                ''
                                                            ) {
                                                                item.style.display =
                                                                    'none';
                                                            }
                                                        }
                                                        item.style.display = '';
                                                        this.vis = {};
                                                        this.vis[
                                                            get_analyze_team_id(
                                                                index,
                                                            )
                                                        ] = 1;
                                                        this.setState({
                                                            vis: this.vis,
                                                        });
                                                    } else if (
                                                        item?.style.display ===
                                                        ''
                                                    ) {
                                                        item.style.display =
                                                            'none';
                                                        this.vis = {};
                                                        this.setState({
                                                            vis: this.vis,
                                                        });
                                                    }
                                                }}
                                            >
                                                <td
                                                    className={
                                                        item.place_className
                                                    }
                                                >
                                                    {item.place}
                                                </td>
                                                {this.state.school === 1 && (
                                                    <td className="stnd">
                                                        <div
                                                            style={{
                                                                display: 'flex',
                                                            }}
                                                        >
                                                            <div
                                                                style={{
                                                                    float:
                                                                        'left',
                                                                    fontFamily:
                                                                        'Georgia',
                                                                    paddingLeft: 5,
                                                                }}
                                                            >
                                                                {
                                                                    item.school_place
                                                                }
                                                            </div>
                                                            <div
                                                                style={{
                                                                    flex: '1',
                                                                }}
                                                            >
                                                                {item.school}
                                                            </div>
                                                            <div
                                                                style={{
                                                                    float:
                                                                        'right',
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </td>
                                                )}
                                                <td className="stnd">
                                                    {item.name}
                                                    <span
                                                        id={`star-${item.team_id}`}
                                                        style={{
                                                            display:
                                                                item.concerned ===
                                                                1
                                                                    ? ''
                                                                    : 'none',
                                                        }}
                                                    >
                                                        <svg
                                                            className="octicon octicon-star-fill"
                                                            height="16"
                                                            viewBox="0 0 16 16"
                                                            version="1.1"
                                                            width="16"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"
                                                            ></path>
                                                        </svg>
                                                    </span>
                                                    {(item.girls === 1 ||
                                                        item.girl === 1) && (
                                                        <svg
                                                            className="icon"
                                                            viewBox="0 0 1024 1024"
                                                            version="1.1"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            p-id="3441"
                                                            width="16"
                                                            height="16"
                                                        >
                                                            <path
                                                                d="M512.335761 254.730044c102.930418 0 186.859667-56.819386 186.859667-126.757785C699.195428 58.0363 615.271057 1.219352 512.335761 1.219352c-102.925541 0-186.851132 56.819386-186.851132 126.752907C325.489506 197.904562 409.415097 254.730044 512.335761 254.730044L512.335761 254.730044zM846.457844 693.99567l-76.005897-146.417404-104.510699-203.241668c-3.171536-5.467576-11.085133-8.741538-19.004827-8.741538L379.321479 335.595061c-7.909939 0-15.833292 3.278839-18.99995 8.741538L287.48229 484.201203 178.223433 693.999328c-11.090011 21.858112-9.503633 42.617588 6.328439 57.914364 15.841827 15.296777 42.760252 22.948213 77.587397 22.948213l99.76376 0 0 249.138094 0 0 39.589936 0 220.110189 0 39.589936 0 0-27.311056L661.19309 774.861906l98.172505 0c34.8369 0 61.754105-8.741538 77.587397-22.948213C854.376319 736.608381 857.542977 715.853782 846.457844 693.99567L846.457844 693.99567z"
                                                                p-id="3442"
                                                            ></path>
                                                        </svg>
                                                    )}
                                                </td>
                                                <td className="stnd">
                                                    {item.solved}
                                                </td>
                                                <td className="stnd">
                                                    {item.time}
                                                </td>
                                                {item.problem.map(
                                                    (item: any) => {
                                                        let ch_status = '-';
                                                        if (
                                                            item.status ===
                                                            'correct'
                                                        )
                                                            ch_status = '+';
                                                        if (
                                                            item.status ===
                                                            'incorrect'
                                                        )
                                                            ch_status = '-';
                                                        if (
                                                            item.status ===
                                                            'pending'
                                                        )
                                                            ch_status = '?';
                                                        if (
                                                            item.status ===
                                                            'unattempted'
                                                        )
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
                                                                    ? parseInt(
                                                                          item.attempt_num,
                                                                      )
                                                                    : ''}
                                                                {this.state
                                                                    .contest_config
                                                                    .status_time[
                                                                    item.status
                                                                ] === 1 &&
                                                                (item.time ||
                                                                    item.time ===
                                                                        0)
                                                                    ? '/' +
                                                                      parseInt(
                                                                          item.time,
                                                                      )
                                                                    : ''}
                                                            </td>
                                                        );
                                                    },
                                                )}
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
                                                    <div
                                                        style={{
                                                            display: 'flex',
                                                        }}
                                                    >
                                                        <div
                                                            style={{
                                                                float: 'left',
                                                                marginTop: 2,
                                                            }}
                                                        >
                                                            <div
                                                                id={`unstar-btn-${item.team_id}`}
                                                                className="star-btn"
                                                                title={`Star ${item.name}`}
                                                                style={{
                                                                    display:
                                                                        item.concerned ===
                                                                        1
                                                                            ? ''
                                                                            : 'none',
                                                                }}
                                                                onClick={() => {
                                                                    let unstar_btn = document.getElementById(
                                                                        `unstar-btn-${item.team_id}`,
                                                                    );
                                                                    let star_btn = document.getElementById(
                                                                        `star-btn-${item.team_id}`,
                                                                    );
                                                                    let star = document.getElementById(
                                                                        `star-${item.team_id}`,
                                                                    );
                                                                    if (
                                                                        unstar_btn?.style
                                                                    ) {
                                                                        unstar_btn.style.display =
                                                                            'none';
                                                                    }
                                                                    if (
                                                                        star_btn?.style
                                                                    ) {
                                                                        star_btn.style.display =
                                                                            '';
                                                                    }
                                                                    if (
                                                                        star?.style
                                                                    ) {
                                                                        star.style.display =
                                                                            'none';
                                                                    }
                                                                    window.localStorage.removeItem(
                                                                        getStarKey(
                                                                            item.team_id,
                                                                        ),
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    className="octicon octicon-star"
                                                                    height="16"
                                                                    viewBox="0 0 16 16"
                                                                    version="1.1"
                                                                    width="16"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"
                                                                    ></path>
                                                                </svg>
                                                                Unstar
                                                            </div>
                                                            <div
                                                                id={`star-btn-${item.team_id}`}
                                                                className="star-btn"
                                                                title={`Star ${item.name}`}
                                                                style={{
                                                                    display:
                                                                        item.concerned ===
                                                                        1
                                                                            ? 'none'
                                                                            : '',
                                                                }}
                                                                onClick={() => {
                                                                    let unstar_btn = document.getElementById(
                                                                        `unstar-btn-${item.team_id}`,
                                                                    );
                                                                    let star_btn = document.getElementById(
                                                                        `star-btn-${item.team_id}`,
                                                                    );
                                                                    let star = document.getElementById(
                                                                        `star-${item.team_id}`,
                                                                    );
                                                                    if (
                                                                        unstar_btn?.style
                                                                    ) {
                                                                        unstar_btn.style.display =
                                                                            '';
                                                                    }
                                                                    if (
                                                                        star_btn?.style
                                                                    ) {
                                                                        star_btn.style.display =
                                                                            'none';
                                                                    }
                                                                    if (
                                                                        star?.style
                                                                    ) {
                                                                        star.style.display =
                                                                            '';
                                                                    }
                                                                    window.localStorage.setItem(
                                                                        getStarKey(
                                                                            item.team_id,
                                                                        ),
                                                                        '1',
                                                                    );
                                                                }}
                                                            >
                                                                <svg
                                                                    className="octicon octicon-star"
                                                                    height="16"
                                                                    viewBox="0 0 16 16"
                                                                    version="1.1"
                                                                    width="16"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
                                                                    ></path>
                                                                </svg>
                                                                Star
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {this.state.vis[
                                                        get_analyze_team_id(
                                                            index,
                                                        )
                                                    ] === 1 && (
                                                        <>
                                                            <Placecharts
                                                                contest_config={
                                                                    this.state
                                                                        .contest_config
                                                                }
                                                                cur_team={item}
                                                                team={
                                                                    this.state
                                                                        .team
                                                                }
                                                                run={
                                                                    this.state
                                                                        .run
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        </>
                                    );
                                },
                            )}

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
                                                    (item.solved / item.total) *
                                                        100,
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
                )}
            </>
        );
    }
}

export default Standings;
