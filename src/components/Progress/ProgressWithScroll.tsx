import React from "react";

import {
  getTimeScroll,
  getTimeFlag,
  timerInterval,
  ProgressStateActiveStyle,
  ProgressStateStyle,
} from "./Progress.core";

import { getQueryParams, getQueryString } from "@/utils";

import style from "./Progress.module.less";

import {
  ProgressWithScrollProps,
  ProgressWithScrollState,
} from "./Progress.type";

import {
  ContestStateType,
  getContestProgressRatio,
  getContestState,
  getContestElapsedTime,
} from "@/core/contest";

class ProgressWithScroll extends React.Component<
  ProgressWithScrollProps,
  ProgressWithScrollState
> {
  timer: NodeJS.Timer = null as unknown as NodeJS.Timer;
  pauseUpdate: boolean = false;
  timeFlag: number = 0;
  init: boolean = false;

  clearTimer() {
    this.timer && clearInterval(this.timer);
  }

  update(props: ProgressWithScrollProps) {
    let bar = document.getElementById("am-progress-bar") as HTMLElement;
    let tooltip = document.getElementById("am-progress-tooltip") as HTMLElement;
    let tooltip_inner = document.getElementById(
      "am-progress-tooltip-inner",
    ) as HTMLElement;

    // (() => {
    //     const timeFlag = getQueryString('timeflag', this.state.search);
    //     if (timeFlag) {
    //         this.timeFlag = parseInt(timeFlag || '');
    //     }
    // })();

    this.setState({
      startTime: props.startTime,
      endTime: props.endTime,
      frozenStartTime: props.frozenStartTime,
      search: props.search,
      history: props.history,
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

      if (!this.pauseUpdate) {
        bar.style.left = [width, "%"].join("");
        tooltip.style.left = [width, "%"].join("");
        tooltip_inner.innerHTML = getContestElapsedTime(
          props.startTime,
          props.endTime,
        );
      } else {
        // const width = getWidthByTimeFlag(props.start_time, props.end_time, this.timeFlag);
        // bar.style.left = [width, '%'].join('');
        // tooltip.style.left = [width, '%'].join('');
        // tooltip_inner.innerHTML = getTimeElapsedByTimeFLag(props.start_time, props.end_time, this.timeFlag);
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

    (() => {
      let scroll = document.getElementById("am-progress-scroll") as HTMLElement;
      let mask = document.getElementById("am-progress-mask") as HTMLElement;
      let bar = document.getElementById("am-progress-bar") as HTMLElement;
      let tooltip = document.getElementById(
        "am-progress-tooltip",
      ) as HTMLElement;
      let tooltip_inner = document.getElementById(
        "am-progress-tooltip-inner",
      ) as HTMLElement;

      let barleft = 0;
      let _this = this;

      scroll.onmouseenter = function (event: any) {
        tooltip.classList.add(style["in"]);
      };
      scroll.onmouseleave = function (event: any) {
        tooltip.classList.remove(style["in"]);
      };

      bar.onmousedown = function (event: any) {
        var event = event || window.event;
        var leftVal = event.clientX - this.offsetLeft;
        var that = this;

        // 拖动一定写到 down 里面才可以
        document.onmousemove = function (event) {
          _this.pauseUpdate = true;

          tooltip.classList.add(style["in"]);
          var event = event || window.event;
          barleft = event.clientX - leftVal;

          if (barleft < 0) {
            barleft = 0;
          } else if (barleft > scroll.offsetWidth - bar.offsetWidth) {
            barleft = scroll.offsetWidth - bar.offsetWidth;
          }

          const maskWidth =
            parseInt(scroll.offsetWidth) * parseInt(mask.style?.width) * 0.01;

          if (barleft >= maskWidth) {
            barleft = maskWidth;
            _this.pauseUpdate = false;
          }

          that.style.left = barleft + "px";
          tooltip.style.left = barleft + "px";
          const width =
            barleft == 0
              ? 0
              : (barleft + bar.offsetWidth) / parseInt(scroll.offsetWidth);

          _this.timeFlag = getTimeFlag(
            _this.state.startTime,
            _this.state.endTime,
            width,
          );

          tooltip_inner.innerHTML = getTimeScroll(
            _this.state.startTime,
            _this.state.endTime,
            width,
          );

          //防止选择内容--当拖动鼠标过快时候，弹起鼠标，bar也会移动，修复bug
          window.getSelection
            ? window.getSelection().removeAllRanges()
            : document.selection.empty();
        };
      };

      document.onmouseup = function () {
        //弹起鼠标不做任何操作
        document.onmousemove = null;
        tooltip.classList.remove(style["in"]);

        let queryParams = getQueryParams(
          "timeflag",
          _this.timeFlag.toString(),
          _this.state.search,
        );

        if (!_this.pauseUpdate) {
          delete queryParams.timeflag;
        }

        const pathname = window.location.pathname;
        _this.state.history.push({
          pathname: pathname,
          query: queryParams,
        });
      };
    })();
  }

  componentWillReceiveProps(nextProps: ProgressWithScrollProps) {
    this.update(nextProps);
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
  }

  state = {
    startTime: this.props.startTime,
    endTime: this.props.endTime,
    frozenStartTime: this.props.frozenStartTime,
    width: 0,
    scrollWidth: 0,
    state: ContestStateType.PENDING,
    search: this.props.search,
    history: this.props.history,
  };

  constructor(props: ProgressWithScrollProps) {
    super(props);
  }

  render() {
    return (
      <>
        <div
          className={[
            style["am-progress"],
            style["am-progress-striped"],
            style[ProgressStateActiveStyle[this.state.state]],
          ].join(" ")}
          style={{ marginBottom: 0, position: "relative" }}
          id={"am-progress-scroll"}
        >
          <div
            className={[
              style["am-progress-bar"],
              style[ProgressStateStyle[this.state.state]],
            ].join(" ")}
            style={{ width: [this.state.width, "%"].join("") }}
            id={"am-progress-mask"}
          >
            <div
              className={[style["tooltip"], style["tooltip-top"]].join(" ")}
              style={{
                marginLeft: -34,
                bottom: 22,
                left: 0,
              }}
              id={"am-progress-tooltip"}
            >
              <div
                className={[style["tooltip-inner"]].join(" ")}
                id={"am-progress-tooltip-inner"}
              >
                {"00:00:00"}
              </div>
            </div>
            <div
              className={[
                style["am-progress-bar"],
                style[ProgressStateStyle[this.state.state]],
                style["am-progress-cursor"],
              ].join(" ")}
              style={{
                left: 0,
              }}
              id={"am-progress-bar"}
            ></div>
          </div>
        </div>
      </>
    );
  }
}

export default ProgressWithScroll;
