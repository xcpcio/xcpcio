import React from 'react';
import { getStatus, status_type, timerInterval, getTimePending } from './model';
import Progress from './Progress';
import style from './Progress.less';

class ProgressSmall extends React.Component {
    timer: any = null;

    update(props: any) {
        this.setState({
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
                time_pending: getTimePending(props.start_time),
            });
        };
        setDynamicParams();
        this.timer && clearInterval(this.timer);
        this.timer = setInterval(() => {
            setDynamicParams();
        }, timerInterval);
    }

    componentDidMount() {
        this.update(this.props);
    }

    componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    componentWillUnmount() {
        this.timer && clearInterval(this.timer);
    }

    state = {
        start_time: 0,
        end_time: 0,
        frozen_time: 0,
        status: 0,
        time_pending: 0,
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
                                style['label'],
                                style[status_type[this.state.status]],
                            ].join(' ')}
                        ></div>
                        <b>
                            {status_type[this.state.status]}&nbsp;
                            {this.state.status === 0 && this.state.time_pending}
                        </b>
                    </div>
                    <div style={{ float: 'right' }}></div>
                </div>

                <Progress
                    start_time={this.state.start_time}
                    end_time={this.state.end_time}
                    frozen_time={this.state.frozen_time}
                />
            </>
        );
    }
}

export { ProgressSmall };
