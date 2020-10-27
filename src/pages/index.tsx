import React from 'react';
import style from './index.less';
import contest_list from '../../contest_list.json';
import Progress_small from '@/components/progress/progress-small';
import {
    deepCopy,
    getTimeDiff,
    timeFormat,
    getQueryString,
} from '@/utils/utils';
import { TreeSelect } from 'antd';

let treeData: any = [];

(() => {
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
})();

function getContest(path: string) {
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

class Index extends React.Component {
    getPath(props: any) {
        return getQueryString('path', props.location.search) || '';
    }

    update(props: any) {
        this.setState({
            contest: getContest(this.getPath(props)),
            defaultValue: this.getPath(props),
        });
    }

    componentDidMount() {
        this.update(this.props);
    }

    constructor(props: any) {
        super(props);
    }

    //props中的值发生改变时执行
    async componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    state = {
        contest: [],
        defaultValue: '',
    };

    onChange = (value: string) => {
        const params = new URLSearchParams(this.props.location.search);
        let query: any = { ...params };
        query['path'] = value;
        this.props.history.push({ query });
    };

    render() {
        return (
            <div className={style.root}>
                <div
                    className={style['border-bottom']}
                    style={{ display: 'flex', marginTop: '20px' }}
                >
                    <div style={{ float: 'left' }}>
                        <TreeSelect
                            style={{ width: '780px' }}
                            value={this.state.value}
                            dropdownStyle={{ maxHeight: 680, overflow: 'auto' }}
                            treeData={treeData}
                            placeholder="Please select"
                            key={this.state.defaultValue}
                            defaultValue={this.state.defaultValue}
                            showCheckedStrategy={TreeSelect.SHOW_PARENT}
                            treeDefaultExpandAll
                            onChange={this.onChange.bind(this)}
                        />
                    </div>
                    <div style={{ flex: '1' }}></div>
                    <div style={{ float: 'right' }}>
                        <a
                            className={[
                                style.go,
                                style['MuiButtonBase-root'],
                                style['MuiIconButton-root'],
                            ].join(' ')}
                            target="_blank"
                            rel="noreferrer"
                            href="https://github.com/XCPCIO/XCPCIO-board"
                            title="Github"
                        >
                            <span className={style['MuiIconButton-label']}>
                                <svg
                                    stroke="currentColor"
                                    fill="currentColor"
                                    strokeWidth="0"
                                    viewBox="0 0 496 512"
                                    height="1em"
                                    width="1em"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
                                </svg>
                            </span>
                            <span
                                className={style['MuiTouchRipple-root']}
                            ></span>
                        </a>
                    </div>
                </div>

                {this.state.contest.map((contest: any) => {
                    return (
                        <div className={style['m-box']}>
                            <div className={style['m-title']}>
                                {contest.contest_name}
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    paddingBottom: '0px',
                                }}
                            >
                                <div
                                    style={{
                                        float: 'left',
                                        textAlign: 'left',
                                        fontSize: '16px',
                                    }}
                                >
                                    Start: {timeFormat(contest.start_time)}
                                    <br />
                                    Duration:{' '}
                                    {getTimeDiff(
                                        contest.end_time - contest.start_time,
                                    )}
                                </div>
                                <div style={{ flex: '1' }}>
                                    <div style={{ width: '72%' }}>
                                        <Progress_small
                                            start_time={contest.start_time}
                                            end_time={contest.end_time}
                                            frozen_time={contest.frozen_time}
                                        />
                                    </div>
                                </div>
                                <div style={{ float: 'right' }}>
                                    <a
                                        className={[
                                            style.go,
                                            style['MuiButtonBase-root'],
                                            style['MuiIconButton-root'],
                                        ].join(' ')}
                                        target="_blank"
                                        rel="noreferrer"
                                        href={contest.link}
                                        style={{}}
                                    >
                                        <span
                                            className={
                                                style['MuiIconButton-label']
                                            }
                                        >
                                            <svg
                                                stroke="currentColor"
                                                fill="currentColor"
                                                strokeWidth="0"
                                                viewBox="0 0 1024 1024"
                                                version="1.1"
                                                xmlns="http://www.w3.org/2000/svg"
                                                p-id="1161"
                                                width="30"
                                                height="30"
                                            >
                                                <path
                                                    d="M837.9904 570.0608H124.5696a29.0304 29.0304 0 0 1-29.0304-29.0304V482.9696a29.0304 29.0304 0 0 1 29.0304-29.0304h713.4208z"
                                                    fill="#2C2C2C"
                                                    p-id="1162"
                                                ></path>
                                                <path
                                                    d="M561.3056 808.96l-40.96-40.96a28.928 28.928 0 0 1 0-40.96l215.04-215.04-215.04-215.04a28.9792 28.9792 0 0 1 0-40.96l40.96-40.96a28.9792 28.9792 0 0 1 40.96 0l296.96 296.96-296.96 296.96a28.9792 28.9792 0 0 1-40.96 0z"
                                                    fill="#2C2C2C"
                                                    p-id="1163"
                                                ></path>
                                            </svg>
                                        </span>
                                        <span
                                            className={
                                                style['MuiTouchRipple-root']
                                            }
                                        ></span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default Index;
