import { Loading } from '@/components/Loading';
import style from './Balloon.less';
import Highlighter from 'react-highlight-words';
import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import {
    Layout,
    Table,
    Input,
    Space,
    Button,
    Skeleton,
    Popconfirm,
    Tooltip,
} from 'antd';
import { deepCopy } from '@/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faGolfBall,
    faHourglassStart,
    faCheckCircle,
    faPaperPlane,
    faUndoAlt,
} from '@fortawesome/free-solid-svg-icons';
import { debounce, throttle } from 'lodash';

interface ActionItem {
    status: boolean;
    solvedId: string;
}

interface BalloonTableItem {
    status: boolean;
    time: number;
    solved: number;
    team: string;
    badge?: string;
    organization?: string;
    total: number[];
    action: ActionItem;
    awards: string;
}

function getSolvedId(team_id: string, problem_id: number) {
    return [team_id, problem_id].join('#$#');
}

function formatTimeNumber(time: number) {
    if (time < 9) return ['0', time].join('');
    return time;
}

function getDisplayTime(time: number) {
    return [
        formatTimeNumber(Math.floor(time / 60 / 60)),
        formatTimeNumber(Math.floor((time / 60) % 60)),
        formatTimeNumber(Math.floor(time % 60)),
    ].join(':');
}

function getBalloonDispatchedListKey() {
    return [window.location.pathname, 'balloon', 'dispatched', 'list'].join(
        '_',
    );
}

class Balloon extends React.Component {
    getColumns(contest_config: any) {
        if (contest_config?.balloon_color == null) return [];
        let columns: any = [];
        columns = [
            ...columns,
            ...[
                {
                    title: 'Status',
                    dataIndex: 'status',
                    key: 'status',
                    width: '2%',
                    align: 'center',
                    filters: [
                        {
                            text: '已派送',
                            value: true,
                        },
                        {
                            text: '未派送',
                            value: false,
                        },
                    ],
                    onFilter: (value, record) => record.status == value,
                    render: (status: boolean) => {
                        if (status === true) {
                            return (
                                <FontAwesomeIcon
                                    size="lg"
                                    icon={faCheckCircle}
                                />
                            );
                        } else {
                            return (
                                <FontAwesomeIcon
                                    size="lg"
                                    icon={faHourglassStart}
                                />
                            );
                        }
                    },
                },
                {
                    title: 'Time',
                    dataIndex: 'time',
                    key: 'time',
                    width: '5%',
                    align: '10%',
                    sorter: (a: any, b: any) => a.time - b.time,
                    render: (time: number) => getDisplayTime(time),
                },
                {
                    title: 'Solved',
                    dataIndex: 'solved',
                    key: 'solved',
                    width: '2%',
                    align: 'center',
                    filters: contest_config.problem_id.map(
                        (name: string, index: number) => {
                            return {
                                text: name,
                                value: index,
                            };
                        },
                    ),
                    onFilter: (value, record) => record.solved == value,
                    render: (solved: number) => {
                        return (
                            <>
                                <FontAwesomeIcon
                                    size="lg"
                                    style={{
                                        color:
                                            contest_config.balloon_color[
                                                solved
                                            ]['background_color'],
                                    }}
                                    icon={faGolfBall}
                                />
                                &nbsp;{contest_config.problem_id[solved]}
                            </>
                        );
                    },
                },
            ],
        ];
        if (contest_config?.badge) {
            columns = [
                ...columns,
                ...[
                    {
                        title: contest_config.badge,
                        dataIndex: 'badge',
                        key: 'badge',
                        width: '5%',
                        align: 'left',
                        render: (base64: string) => {
                            return (
                                <img
                                    width="32"
                                    height="32"
                                    src={[
                                        'data:image/png;base64,',
                                        base64,
                                    ].join('')}
                                />
                            );
                        },
                    },
                ],
            ];
        }
        if (contest_config?.organization) {
            columns = [
                ...columns,
                ...[
                    {
                        title: contest_config.organization,
                        dataIndex: 'organization',
                        key: 'organization',
                        width: '20%',
                        align: 'left',
                        ...this.getColumnSearchProps('organization'),
                    },
                ],
            ];
        }
        columns = [
            ...columns,
            ...[
                {
                    title: 'Team',
                    dataIndex: 'team',
                    key: 'team',
                    width: '20%',
                    align: 'left',
                    ...this.getColumnSearchProps('team'),
                },
                {
                    title: 'Total',
                    dataIndex: 'total',
                    key: 'total',
                    width: '15%',
                    align: 'left',
                    render: (solved_list: number[]) => {
                        return solved_list.map(solved => {
                            return (
                                <FontAwesomeIcon
                                    size="lg"
                                    style={{
                                        color:
                                            contest_config.balloon_color[
                                                solved
                                            ]['background_color'],
                                    }}
                                    icon={faGolfBall}
                                />
                            );
                        });
                    },
                },
                {
                    title: 'Awards',
                    dataIndex: 'awards',
                    key: 'awards',
                    width: '10%',
                    align: 'left',
                },
                {
                    title: 'Action',
                    dataIndex: 'action',
                    key: 'action',
                    width: '5%',
                    align: 'center',
                    render: (action: ActionItem) => {
                        if (action.status) {
                            return (
                                <div
                                    className={style.touch}
                                    onClick={() => {
                                        let balloon_dispatched_list: string[] = JSON.parse(
                                            window.localStorage.getItem(
                                                getBalloonDispatchedListKey(),
                                            ) || '[]',
                                        );
                                        balloon_dispatched_list = balloon_dispatched_list.filter(
                                            x => x !== action.solvedId,
                                        );
                                        balloon_dispatched_list = Array.from(
                                            new Set(balloon_dispatched_list),
                                        );
                                        window.localStorage.setItem(
                                            getBalloonDispatchedListKey(),
                                            JSON.stringify(
                                                balloon_dispatched_list,
                                            ),
                                        );
                                        debounce(this.update, 100).bind(this)(
                                            this.props,
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faUndoAlt}
                                    />
                                </div>
                            );
                        } else {
                            return (
                                <div
                                    className={style.touch}
                                    onClick={() => {
                                        let balloon_dispatched_list: string[] = JSON.parse(
                                            window.localStorage.getItem(
                                                getBalloonDispatchedListKey(),
                                            ) || '[]',
                                        );
                                        balloon_dispatched_list.push(
                                            action.solvedId,
                                        );
                                        balloon_dispatched_list = Array.from(
                                            new Set(balloon_dispatched_list),
                                        );
                                        window.localStorage.setItem(
                                            getBalloonDispatchedListKey(),
                                            JSON.stringify(
                                                balloon_dispatched_list,
                                            ),
                                        );
                                        debounce(this.update, 100).bind(this)(
                                            this.props,
                                        );
                                    }}
                                >
                                    <FontAwesomeIcon
                                        size="lg"
                                        icon={faPaperPlane}
                                    />
                                </div>
                            );
                        }
                    },
                },
            ],
        ];
        return columns;
    }

    getTableData(contest_config: any, team: any, run: any) {
        if (contest_config?.balloon_color == null) return [];
        let tableData: BalloonTableItem[] = [];
        for (let k in team) {
            team[k]['total'] = [];
        }
        const balloon_dispatched_set = new Set(
            JSON.parse(
                window.localStorage.getItem(getBalloonDispatchedListKey()) ||
                    '[]',
            ),
        );
        let first_solved = new Set();
        run.filter(x => x.status === 'correct').forEach((run: any) => {
            team[run.team_id].total.push(run.problem_id);
            team[run.team_id].total.sort((a: number, b: number) => a - b);
            let awards = '';
            if (!first_solved.has(run.problem_id)) {
                awards = `First to solved problem ${
                    contest_config['problem_id'][run.problem_id]
                }`;
                first_solved.add(run.problem_id);
            }
            const status = balloon_dispatched_set.has(
                getSolvedId(run.team_id, run.problem_id),
            );
            let tableItem: BalloonTableItem = {
                status: status,
                time: run.timestamp,
                solved: run.problem_id as number,
                total: deepCopy(team[run.team_id].total),
                action: {
                    status: status,
                    solvedId: getSolvedId(run.team_id, run.problem_id),
                },
                team: team[run.team_id].name,
                awards: awards,
            };
            if (contest_config?.badge) {
                tableItem.badge = team[run.team_id].badge?.base64;
            }
            if (contest_config?.organization) {
                tableItem.organization = team[run.team_id].organization;
            }
            tableData.push(tableItem);
        });
        tableData.sort((a: BalloonTableItem, b: BalloonTableItem) => {
            if (a.status && !b.status) return 1;
            if (!a.status && b.status) return -1;
            if (a.time < b.time) return 1;
            if (a.time > b.time) return -1;
            return 0;
        });
        return tableData;
    }

    update(props: any) {
        const tableData = this.getTableData(
            props.contest_config,
            props.team,
            props.run,
        );
        const columns = this.getColumns(props.contest_config);
        this.setState({
            loaded: true,
            on: props.contest_config?.balloon_color ? true : false,
            tableData: deepCopy(tableData),
            columns: columns,
        });
    }

    async componentWillMount() {
        this.update(this.props);
    }

    //在组件已经被渲染到 DOM 中后运行
    async componentDidMount() {}

    //props中的值发生改变时执行
    async componentWillReceiveProps(nextProps: any) {
        debounce(this.update, 100).bind(this)(nextProps);
    }

    //组件卸载前的操作
    componentWillUnmount() {}

    state = {
        loaded: false,
        on: false,
        searchText: '',
        searchedColumn: '',
        tableData: [],
        columns: [],
    };

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({
            setSelectedKeys,
            selectedKeys,
            confirm,
            clearFilters,
        }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e =>
                        setSelectedKeys(e.target.value ? [e.target.value] : [])
                    }
                    onPressEnter={() =>
                        this.handleSearch(selectedKeys, confirm, dataIndex)
                    }
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() =>
                            this.handleSearch(selectedKeys, confirm, dataIndex)
                        }
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => this.handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => (
            <SearchOutlined
                style={{ color: filtered ? '#1890ff' : undefined }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                text
            ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({ searchText: '' });
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <>
                {this.state.loaded === false && (
                    <div className={style.loading}>
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && this.state.on === false && (
                    <>
                        <br />
                        <br />
                        <h2>该场比赛未分配气球颜色，不能使用该功能。</h2>
                    </>
                )}

                {this.state.loaded === true && this.state.on === true && (
                    <>
                        <Table
                            style={{ marginTop: 20 }}
                            size="small"
                            columns={this.state.columns}
                            dataSource={this.state.tableData}
                            className={style.BalloonTable}
                            pagination={{
                                hideOnSinglePage: true,
                                showQuickJumper: true,
                                showSizeChanger: true,
                                defaultPageSize: 15,
                                pageSizeOptions: [
                                    '10',
                                    '15',
                                    '30',
                                    '50',
                                    '100',
                                ],
                            }}
                        />
                    </>
                )}
            </>
        );
    }
}

export { Balloon };
