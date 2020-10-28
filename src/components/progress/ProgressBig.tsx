import React from 'react';
import style from './Progress.less';
import { timeFormat } from '@/utils/utils';
import Progress from './Progress';
import {
    getStatus,
    status_type,
    timerInterval,
    getTimeElapsed,
    getTimePending,
    getTimeRemaining,
} from './model';

class ProgressBig extends React.Component {
    timer: any = null;

    update(props: any) {
        this.setState({
            head_item: props.head_item,
            start_time: props.start_time,
            end_time: props.end_time,
            frozen_time: props.frozen_time,
        });
        const setDynamicParams = () => {
            this.setState({
                status: getStatus(
                    props.start_time,
                    props.end_time,
                    props.frozen_time,
                ),
                time_elapsed: getTimeElapsed(props.start_time, props.end_time),
                time_remaining: getTimeRemaining(
                    props.start_time,
                    props.end_time,
                ),
                time_pending: getTimePending(props.start_time),
            });
        };
        setDynamicParams();
        this.timer && clearInterval(this.timer);
        this.timer = setInterval(() => {
            setDynamicParams();
        }, timerInterval);
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
                                style['label'],
                                style[status_type[this.state.status]],
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

                <Progress
                    start_time={this.state.start_time}
                    end_time={this.state.end_time}
                    frozen_time={this.state.frozen_time}
                />

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

export { ProgressBig };
