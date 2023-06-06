import React from "react";

import ProgressWithScroll from "./ProgressWithScroll";
import style from "./Progress.module.less";

import { ProgressStateText, timerInterval } from "./Progress.core";
import { ProgressBigProps, ProgressBigState } from "./Progress.type";

import {
  ContestStateType,
  getContestElapsedTime,
  getContestPendingTime,
  getContestRemainingTime,
  getContestState,
} from "@/core";

class ProgressBig extends React.Component<ProgressBigProps, ProgressBigState> {
  timer: NodeJS.Timer = null as unknown as NodeJS.Timer;

  clearTimer() {
    this.timer && clearInterval(this.timer);
  }

  update(props: ProgressBigProps) {
    this.setState({
      head_item: props.head_item,
      startTime: props.startTime,
      endTime: props.endTime,
      frozenStartTime: props.frozenStartTime,
      search: props.search,
      history: props.history,
    });

    const setDynamicParams = () => {
      this.setState({
        state: getContestState(
          props.startTime,
          props.endTime,
          props.frozenStartTime,
        ),
        pendingTime: getContestPendingTime(props.startTime),
        remainingTime: getContestRemainingTime(props.endTime),
        elapsedTime: getContestElapsedTime(props.startTime, props.endTime),
      });
    };

    setDynamicParams();

    this.clearTimer();
    this.timer = setInterval(() => {
      setDynamicParams();
    }, timerInterval);
  }

  // 在组件已经被渲染到 DOM 中后运行
  componentDidMount() {
    this.update(this.props);
  }

  // props中的值发生改变时执行
  componentWillReceiveProps(nextProps: ProgressBigProps) {
    this.update(nextProps);
  }

  // 组件卸载前的操作
  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  state = {
    head_item: null,
    startTime: this.props.startTime,
    endTime: this.props.endTime,
    frozenStartTime: this.props.frozenStartTime,
    state: ContestStateType.PENDING,
    search: this.props.search,
    history: this.props.history,
    pendingTime: "",
    remainingTime: "",
    elapsedTime: "",
  };

  constructor(props: ProgressBigProps) {
    super(props);
  }

  render() {
    return (
      <>
        <div
          style={{
            marginBottom: "2px",
            display: "flex",
            fontSize: "16px",
          }}
        >
          <div style={{ float: "left" }}>
            <b>
              Start: {this.state.startTime.format("YYYY-MM-DD HH:mm:ss")}
              <sup>{this.state.startTime.format("z")}</sup>
            </b>
          </div>
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
          <div style={{ float: "right" }}>
            <b>
              End: {this.state.endTime.format("YYYY-MM-DD HH:mm:ss")}
              <sup>{this.state.endTime.format("z")}</sup>
            </b>
          </div>
        </div>
        <ProgressWithScroll
          startTime={this.state.startTime}
          endTime={this.state.endTime}
          frozenStartTime={this.state.frozenStartTime}
          search={this.state.search}
          history={this.state.history}
        />
        <div
          style={{
            marginTop: "2px",
            display: "flex",
            fontSize: "16px",
          }}
        >
          <div style={{ float: "left" }}>
            <b>Elapsed: {this.state.elapsedTime}</b>
          </div>
          <div style={{ flex: "1" }}>{this.state.head_item}</div>
          <div style={{ float: "right" }}>
            <b>Remaining: {this.state.remainingTime}</b>
          </div>
        </div>
      </>
    );
  }
}

export { ProgressBig };
