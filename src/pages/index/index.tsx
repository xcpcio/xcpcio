import React from 'react';
import style from './index.less';
import { ProgressSmall } from '@/components/Progress';
import { timeFormat, getQueryString, getQueryParams } from '@/utils';
import { TreeSelect } from 'antd';
import { getTreeData, getContest, getDuration } from './model';
import { GithubIcon, RightArrowIcon } from '@/icons';

const treeData = getTreeData();

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

    componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    state = {
        contest: [],
        defaultValue: '',
    };

    onChange = (value: string) => {
        const pathname = window.location.pathname;
        const query = getQueryParams('path', value, this.props.location.search);
        this.props.history.push({
            pathname: pathname,
            query: query,
        });
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
                                <GithubIcon />
                            </span>
                            <span
                                className={style['MuiTouchRipple-root']}
                            ></span>
                        </a>
                    </div>
                </div>

                {this.state.contest.map((contest: any, index: number) => {
                    return (
                        <div key={index} className={style['m-box']}>
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
                                    Duration:
                                    {getDuration(
                                        contest.start_time,
                                        contest.end_time,
                                    )}
                                </div>
                                <div style={{ flex: '1' }}>
                                    <div style={{ width: '72%' }}>
                                        <ProgressSmall
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
                                            <RightArrowIcon />
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
