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

let timer: any = null;

class Progress_small extends React.Component {
    update(props: any) {
        this.setState({
            start_time: props.start_time,
            end_time: props.end_time,
            frozen_time: props.frozen_time,
            status: getStatus(
                props.start_time,
                props.end_time,
                props.frozen_time,
            ),
            width: getWidth(props.start_time, props.end_time),
        });

        timer && clearInterval(timer);
        timer = setInterval(() => {
            this.setState({
                status: getStatus(
                    this.state.start_time,
                    this.state.end_time,
                    this.state.frozen_time,
                ),
                width: getWidth(this.state.start_time, this.state.end_time),
            });
        }, 100);
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
        timer && clearInterval(timer);
    }

    state = {
        start_time: 0,
        end_time: 0,
        frozen_time: 0,
        status: 0,
        width: 100,
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <>
                <div style={{ marginBottom: '2px', display: 'flex' }}>
                    <div style={{ float: 'left' }}></div>
                    <div style={{ flex: '1' }}>
                        <div
                            className={[
                                'label',
                                status_type[this.state.status],
                            ].join(' ')}
                        ></div>
                        <b>{status_type[this.state.status]}</b>
                    </div>
                    <div style={{ float: 'right' }}></div>
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
            </>
        );
    }
}

export default Progress_small;
