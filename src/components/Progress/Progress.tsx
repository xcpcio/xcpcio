import React from "react";
import style from "./Progress.module.less";

import {
  ProgressStateActiveStyle,
  ProgressStateStyle,
  timerInterval,
} from "./Progress.core";
import { ProgressProps, ProgressState } from "./Progress.type";

import {
  ContestStateType,
  getContestProgressRatio,
  getContestState,
} from "@/core/contest";

class Progress extends React.Component<ProgressProps, ProgressState> {
  timer: NodeJS.Timer = null as unknown as NodeJS.Timer;

  clearTimer() {
    this.timer && clearInterval(this.timer);
  }

  update(props: ProgressProps) {
    this.setState({
      startTime: props.startTime,
      endTime: props.endTime,
      frozenStartTime: props.frozenStartTime,
    });

    const setStatusAndWidth = () => {
      const width = getContestProgressRatio(props.startTime, props.endTime);

      this.setState({
        state: getContestState(
          props.startTime,
          props.endTime,
          props.frozenStartTime,
        ),
        width: width,
      });

      if (width >= 100) {
        this.clearTimer();
      }
    };

    setStatusAndWidth();

    this.clearTimer();
    this.timer = setInterval(() => {
      setStatusAndWidth();
    }, timerInterval);
  }

  componentDidMount() {
    this.update(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps: ProgressProps) {
    this.update(nextProps);
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  constructor(props: ProgressProps) {
    super(props);
  }

  state = {
    startTime: this.props.startTime,
    endTime: this.props.endTime,
    frozenStartTime: this.props.frozenStartTime,
    width: 0,
    state: ContestStateType.PENDING,
  };

  render() {
    return (
      <>
        <div
          className={[
            style["am-progress"],
            style["am-progress-striped"],
            style[ProgressStateActiveStyle[this.state.state]],
          ].join(" ")}
          style={{ marginBottom: 0 }}
        >
          <div
            className={[
              style["am-progress-bar"],
              style[ProgressStateStyle[this.state.state]],
            ].join(" ")}
            style={{ width: [this.state.width, "%"].join("") }}
          ></div>
        </div>
      </>
    );
  }
}

export default Progress;
