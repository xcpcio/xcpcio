import React from "react";

import Progress from "./Progress";
import style from "./Progress.module.less";

import { ProgressProps, ProgressState } from "./Progress.type";
import { ProgressStateText, timerInterval } from "./Progress.core";

import {
  getContestState,
  getContestPendingTime,
  ContestStateType,
} from "@/core/contest";

class ProgressSmall extends React.Component<ProgressProps, ProgressState> {
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

    const setDynamicParams = () => {
      this.setState({
        state: getContestState(
          props.startTime,
          props.endTime,
          props.frozenStartTime,
        ),
        pendingTime: getContestPendingTime(props.startTime),
      });
    };

    setDynamicParams();

    this.clearTimer();
    this.timer = setInterval(() => {
      setDynamicParams();
    }, timerInterval);
  }

  componentDidMount() {
    this.update(this.props);
  }

  UNSAVE_componentWillReceiveProps(nextProps: ProgressProps) {
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
    pendingTime: "",
    state: ContestStateType.PENDING,
  };

  render() {
    return (
      <>
        <div style={{ marginBottom: "2px", display: "flex" }}>
          <div style={{ float: "left" }}></div>
          <div style={{ flex: "1" }}>
            <div
              className={[
                style["label"],
                style[ProgressStateText[this.state.state]],
              ].join(" ")}
            ></div>
            <b>
              {ProgressStateText[this.state.state]}&nbsp;
              {this.state.state === ContestStateType.PENDING &&
                this.state.pendingTime}
            </b>
          </div>
          <div style={{ float: "right" }}></div>
        </div>

        <Progress
          startTime={this.state.startTime}
          endTime={this.state.endTime}
          frozenStartTime={this.state.frozenStartTime}
        />
      </>
    );
  }
}

export { ProgressSmall };
