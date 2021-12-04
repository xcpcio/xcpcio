import React from 'react';
import style from './Progress.module.less';

import { timeFormat } from '@/utils/utils';

import ProgressWithScroll from './ProgressWithScroll';

import {
  getStatus,
  status_type,
  timerInterval,
  getTimeElapsed,
  getTimePending,
  getTimeRemaining,
} from './Progress.core';

import { ProgressBigProps } from './Progress.type';

class ProgressBig extends React.Component<ProgressBigProps> {
  timer: NodeJS.Timer = null as unknown as NodeJS.Timer;

  update(props: ProgressBigProps) {
    this.setState({
      head_item: props.head_item,
      start_time: props.start_time,
      end_time: props.end_time,
      frozen_time: props.frozen_time,
      search: props.search,
      history: props.history,
    });

    const setDynamicParams = () => {
      this.setState({
        status: getStatus(props.start_time, props.end_time, props.frozen_time),
        time_elapsed: getTimeElapsed(props.start_time, props.end_time),
        time_remaining: getTimeRemaining(props.start_time, props.end_time),
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
  componentDidMount() {
    this.update(this.props);
  }

  //props中的值发生改变时执行
  componentWillReceiveProps(nextProps: ProgressBigProps) {
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
    search: null,
    history: null,
  };

  constructor(props: ProgressBigProps) {
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

        <ProgressWithScroll
          start_time={this.state.start_time}
          end_time={this.state.end_time}
          frozen_time={this.state.frozen_time}
          search={this.state.search}
          history={this.state.history}
        />

        <div
          style={{
            marginTop: '2px',
            display: 'flex',
            fontSize: '16px',
          }}
        >
          <div style={{ float: 'left' }}>
            <b>Elapsed: {this.state.time_elapsed}</b>
          </div>
          <div style={{ flex: '1' }}>{this.state.head_item}</div>
          <div style={{ float: 'right' }}>
            <b>Remaining: {this.state.time_remaining}</b>
          </div>
        </div>
      </>
    );
  }
}

export { ProgressBig };
