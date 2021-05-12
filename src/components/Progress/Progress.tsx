import React from 'react';
import style from './Progress.less';
import { getStatus, getWidth, progress_active, progress_status } from './model';

class Progress extends React.Component {
  timer: any = null;

  clearTimer() {
    this.timer && clearInterval(this.timer);
  }

  update(props: any) {
    this.setState({
      start_time: props.start_time,
      end_time: props.end_time,
      frozen_time: props.frozen_time,
    });
    const setStatusAndWIdth = () => {
      const width = getWidth(props.start_time, props.end_time);
      this.setState({
        status: getStatus(props.start_time, props.end_time, props.frozen_time),
        width: width,
      });
      if (width >= 100) {
        this.clearTimer();
      }
    };
    setStatusAndWIdth();
    this.clearTimer();
    this.timer = setInterval(() => {
      setStatusAndWIdth();
    }, 500);
  }

  componentDidMount() {
    this.update(this.props);
  }

  componentWillReceiveProps(nextProps: any) {
    this.update(nextProps);
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  state = {
    start_time: 0,
    end_time: 0,
    frozen_time: 0,
    status: 0,
    width: 0,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <>
        <div
          className={[
            style['am-progress'],
            style['am-progress-striped'],
            style[progress_active[this.state.status]],
          ].join(' ')}
          style={{ marginBottom: 0 }}
        >
          <div
            className={[
              style['am-progress-bar'],
              style[progress_status[this.state.status]],
            ].join(' ')}
            style={{ width: [this.state.width, '%'].join('') }}
          ></div>
        </div>
      </>
    );
  }
}

export default Progress;
