import React from 'react';
import './progress.css';
import './status.css';
import '../standings/standings.css';
import { timeFormat, getTimeDiff, getNowTimeStamp } from '@/utils/utils';

const status_type = ['PENDING', 'RUNNING', 'FROZEND', 'FINISHED'];
const progress_status = [
    'am-progress-bar-primary',
    'am-progress-bar-success',
    'am-progress-bar-danger',
    'am-progress-bar-secondary',
];
const progress_active = ['am-active', 'am-active', 'am-active', ''];

function getStatus(start_time: number, end_time: number, frozen_time: number) {
    const now = getNowTimeStamp();
    if (now < start_time) return 0;
    if (now >= end_time) return 3;
    if (now >= end_time - frozen_time) return 2;
    return 1;
}

function getWidth(start_time: number, end_time: number) {
    const now = getNowTimeStamp();
    if (now < start_time || now >= end_time) return 100;
    return Math.round(((now - start_time) / (end_time - start_time)) * 100);
}

class Progress extends React.Component {
    timer: any = null;

    update(props: any) {
        this.setState({
            head_item: props.head_item,
            start_time: props.start_time,
            end_time: props.end_time,
            frozen_time: props.frozen_time,
            status: getStatus(
                props.start_time,
                props.end_time,
                props.frozen_time,
            ),
            width: getWidth(props.start_time, props.end_time),
            time_elapsed: getTimeDiff(
                Math.max(
                    0,
                    Math.min(getNowTimeStamp(), props.end_time) -
                        props.start_time,
                ),
            ),
            time_remaining: getTimeDiff(
                Math.max(
                    0,
                    props.end_time -
                        Math.max(props.start_time, getNowTimeStamp()),
                ),
            ),
            time_pending: getTimeDiff(
                Math.max(0, props.start_time - getNowTimeStamp()),
            ),
        });

        this.timer && clearInterval(this.timer);
        this.timer = setInterval(() => {
            this.setState({
                status: getStatus(
                    this.state.start_time,
                    this.state.end_time,
                    this.state.frozen_time,
                ),
                width: getWidth(this.state.start_time, this.state.end_time),
                time_elapsed: getTimeDiff(
                    Math.max(
                        0,
                        Math.min(getNowTimeStamp(), this.state.end_time) -
                            this.state.start_time,
                    ),
                ),
                time_remaining: getTimeDiff(
                    Math.max(
                        0,
                        this.state.end_time -
                            Math.max(this.state.start_time, getNowTimeStamp()),
                    ),
                ),
                time_pending: getTimeDiff(
                    Math.max(0, props.start_time - getNowTimeStamp()),
                ),
            });
        }, 500);
    }

    //在组件已经被渲染到 DOM 中后运行
    async componentDidMount() {
        this.update(this.props);
    }

    //props中的值发生改变时执行
    async componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    }

    state = {
        head_item: null,
        start_time: 0,
        end_time: 0,
        frozen_time: 0,
        status: 0,
        width: 0,
        time_elapsed: 0,
        time_remaining: 0,
        time_pending: 0,
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <>
                <div
                    style={{
                        marginBottom: '2px',
                        display: 'flex',
                        fontSize: '16px',
                    }}
                >
                    <div style={{ float: 'left' }}>
                        <b>Start: {timeFormat(this.state.start_time)}</b>
                    </div>
                    <div style={{ flex: '1' }}>
                        <div
                            className={[
                                'label',
                                status_type[this.state.status],
                            ].join(' ')}
                        ></div>
                        <b>
                            {status_type[this.state.status]}&nbsp;
                            {this.state.status === 0 && this.state.time_pending}
                        </b>
                    </div>
                    <div style={{ float: 'right' }}>
                        <b>End: {timeFormat(this.state.end_time)}</b>
                    </div>
                </div>

                <div
                    className={[
                        'am-progress',
                        'am-progress-striped',
                        progress_active[this.state.status],
                    ].join(' ')}
                    style={{ marginBottom: 0 }}
                >
                    <div
                        className={[
                            'am-progress-bar',
                            progress_status[this.state.status],
                        ].join(' ')}
                        style={{ width: [this.state.width, '%'].join('') }}
                    ></div>
                </div>

                <div
                    style={{
                        marginTop: '2px',
                        display: 'flex',
                        fontSize: '16px',
                    }}
                >
                    <div style={{ float: 'left' }}>
                        <b>Time Elapsed: {this.state.time_elapsed}</b>
                    </div>
                    <div style={{ flex: '1' }}>{this.state.head_item}</div>
                    <div style={{ float: 'right' }}>
                        <b>Time Remaining: {this.state.time_remaining}</b>
                    </div>
                </div>
            </>
        );
    }
}

export default Progress;
