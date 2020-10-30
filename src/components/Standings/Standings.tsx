import React from 'react';
import style from './Standings.less';
import starStyle from './Star.less';
import { Placecharts } from './components';
import { Loading } from '@/components/Loading';
import { getStarKey } from '@/utils/utils';
import {
    INF,
    timerInterval,
    getAnalyzeTeamId,
    getProblemList,
    getTeamList,
} from './model';
import { GirlIcon, LikeIcon, StarIcon } from '@/icons';

class Standings extends React.Component {
    timer: any = null;

    clearTimer() {
        this.timer && clearTimeout(this.timer);
    }

    update(props: any) {
        let problem_list = getProblemList(props.contest_config, props.run);
        let team_list = getTeamList(
            props.contest_config,
            props.team,
            props.run,
            problem_list,
        );

        this.setState({
            problem_list: problem_list,
            team_list: team_list,
            contest_config: props.contest_config,
            team: props.team,
            run: props.run,
            organization: props.contest_config?.organization ? 1 : 0,
            badge: props.contest_config?.badge ? 1 : 0,
            loaded: true,
        });
    }

    getInfoCol() {
        return 4 + this.state.organization + this.state.badge;
    }

    getProblemCol() {
        return this.state.contest_config?.problem_id?.length;
    }

    componentDidMount() {
        this.clearTimer();
        this.timer = setTimeout(() => {
            this.update(this.props);
        }, timerInterval);
    }

    //props中的值发生改变时执行
    componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        this.clearTimer();
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
        organization: 0,
        badge: 0,
        vis: {},
        loaded: false,
    };

    render() {
        return (
            <>
                {this.state.loaded === false && (
                    <div className={style.loading}>
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <table
                        style={{ marginTop: '5px' }}
                        className={style.standings}
                    >
                        <thead>
                            <tr>
                                <th
                                    className={style.title}
                                    style={{ width: '3em' }}
                                >
                                    Place
                                </th>
                                {this.state.badge === 1 && (
                                    <th
                                        className={style.title}
                                        style={{ width: '3em' }}
                                    >
                                        {this.state.contest_config.badge}
                                    </th>
                                )}
                                {this.state.organization === 1 && (
                                    <th
                                        className={style.title}
                                        style={{ minWidth: '12em' }}
                                    >
                                        {this.state.contest_config.organization}
                                    </th>
                                )}
                                <th
                                    className={style.title}
                                    style={{ minWidth: '12em' }}
                                >
                                    Team
                                </th>
                                <th
                                    className={style.title}
                                    style={{ width: '3em' }}
                                >
                                    Solved
                                </th>
                                <th
                                    className={style.title}
                                    style={{ width: '3em' }}
                                >
                                    Time
                                </th>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <th
                                            className={style.success}
                                            style={{
                                                width: '4em',
                                                backgroundColor:
                                                    item.balloon_color
                                                        ?.background_color ||
                                                    '',
                                                color:
                                                    item.balloon_color?.color ||
                                                    '',
                                            }}
                                        >
                                            {[
                                                this.state.contest_config
                                                    .problem_id[
                                                    item.problem_id
                                                ],
                                            ]}
                                            <br />
                                            <s>{item.solved}</s>
                                        </th>
                                    );
                                })}

                                <th
                                    className={style.title}
                                    style={{ width: '3em' }}
                                >
                                    Dirt
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.team_list.map(
                                (item: any, index: number) => {
                                    return (
                                        <>
                                            <tr
                                                className={[
                                                    style[
                                                        [
                                                            'stand',
                                                            item.stand_className_id,
                                                        ].join('')
                                                    ],
                                                    style.team,
                                                ].join(' ')}
                                                onClick={() => {
                                                    let item = document.getElementById(
                                                        getAnalyzeTeamId(index),
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
                                                            getAnalyzeTeamId(
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
                                                        style[
                                                            item.place_className
                                                        ]
                                                    }
                                                >
                                                    {item.place}
                                                </td>
                                                {this.state.badge === 1 && (
                                                    <td className={style.empty}>
                                                        <img
                                                            src={
                                                                item.badge?.src
                                                            }
                                                            width={32}
                                                            height={32}
                                                            alt=""
                                                        />
                                                    </td>
                                                )}
                                                {this.state.organization ===
                                                    1 && (
                                                    <td className={style.stnd}>
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
                                                                    item.organization_place
                                                                }
                                                            </div>
                                                            <div
                                                                style={{
                                                                    flex: '1',
                                                                }}
                                                            >
                                                                {
                                                                    item.organization
                                                                }
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
                                                <td className={style.stnd}>
                                                    {item.name}
                                                    {item.unofficial === 1 && (
                                                        <StarIcon />
                                                    )}
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
                                                        <LikeIcon />
                                                    </span>
                                                    {item.girl === 1 && (
                                                        <GirlIcon />
                                                    )}
                                                </td>

                                                <td className={style.stnd}>
                                                    {item.solved}
                                                </td>

                                                <td className={style.stnd}>
                                                    {item.time}
                                                </td>

                                                {item.problem.map(
                                                    (item: any) => {
                                                        let ch_status = (() => {
                                                            switch (
                                                                item.status
                                                            ) {
                                                                case 'correct':
                                                                    return '+';
                                                                case 'incorrect':
                                                                    return '-';
                                                                case 'pending':
                                                                    return '?';
                                                                case 'unattempted':
                                                                    return '.';
                                                                default:
                                                                    return '.';
                                                            }
                                                        })();
                                                        return (
                                                            <td
                                                                className={
                                                                    style[
                                                                        item
                                                                            .status_className
                                                                    ]
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
                                                                    ?.status_time_display[
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

                                                <td className={style.stnd}>
                                                    {[
                                                        item.solved > 0
                                                            ? Math.floor(
                                                                  ((item.attempted -
                                                                      item.solved) /
                                                                      item.attempted) *
                                                                      100,
                                                              )
                                                            : 0,
                                                        '%',
                                                    ].join('')}
                                                </td>
                                            </tr>

                                            <tr
                                                style={{ display: 'none' }}
                                                id={getAnalyzeTeamId(index)}
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
                                                                className={
                                                                    starStyle[
                                                                        'star-btn'
                                                                    ]
                                                                }
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
                                                                    className={
                                                                        starStyle[
                                                                            'octicon-star'
                                                                        ]
                                                                    }
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
                                                                className={
                                                                    starStyle[
                                                                        'star-btn'
                                                                    ]
                                                                }
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
                                                                    className={
                                                                        starStyle[
                                                                            'octicon-star'
                                                                        ]
                                                                    }
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

                                                            {item.info && (
                                                                <span
                                                                    style={{
                                                                        paddingLeft:
                                                                            '10px',
                                                                    }}
                                                                >
                                                                    {item.info}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {this.state.vis[
                                                        getAnalyzeTeamId(index)
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

                            <tr className={style['statistics-0']}>
                                <td
                                    className={style.empty}
                                    colSpan={this.getInfoCol() - 1}
                                ></td>
                                <td className={style.stnd}>
                                    <b>Attempted:</b>
                                </td>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <td className={style.stnd}>
                                            <b>{item.total}</b>
                                        </td>
                                    );
                                })}
                            </tr>

                            <tr className={style['statistics-1']}>
                                <td
                                    className={style.empty}
                                    colSpan={this.getInfoCol() - 1}
                                ></td>
                                <td className={style.stnd}>
                                    <b>Accepted:</b>
                                </td>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <td className={style.stnd}>
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

                            <tr className={style['statistics-0']}>
                                <td
                                    className={style.empty}
                                    colSpan={this.getInfoCol() - 1}
                                ></td>
                                <td className={style.stnd}>
                                    <b>Dirt:</b>
                                </td>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <td className={style.stnd}>
                                            <b>
                                                {item.attempted - item.solved}
                                            </b>
                                            <br />
                                            <b>
                                                (
                                                {Math.round(
                                                    ((item.attempted -
                                                        item.solved) /
                                                        item.total) *
                                                        100,
                                                )}
                                                {item.total === 0 ? '' : '%'})
                                            </b>
                                        </td>
                                    );
                                })}
                            </tr>

                            <tr className={style['statistics-1']}>
                                <td
                                    className={style.empty}
                                    colSpan={this.getInfoCol() - 1}
                                ></td>
                                <td className={style.stnd}>
                                    <b>First Solved:</b>
                                </td>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <td className={style.stnd}>
                                            <b>
                                                {item.first_solve_time === INF
                                                    ? 'N/A'
                                                    : item.first_solve_time}
                                            </b>
                                        </td>
                                    );
                                })}
                            </tr>

                            <tr className={style['statistics-0']}>
                                <td
                                    className={style.empty}
                                    colSpan={this.getInfoCol() - 1}
                                ></td>
                                <td className={style.stnd}>
                                    <b>Last Solved:</b>
                                </td>
                                {this.state.problem_list.map((item: any) => {
                                    return (
                                        <td className={style.stnd}>
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

export { Standings };
