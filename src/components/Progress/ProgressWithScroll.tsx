import React from "react";
import {
  getStatus,
  getWidth,
  progress_active,
  progress_status,
  getTimeScroll,
  getTimeElapsed,
  getTimeFlag,
  getWidthByTimeFlag,
  getTimeElapsedByTimeFLag,
} from "./model";
import { getQueryParams, getQueryString } from "@/utils";

import style from "./Progress.module.less";
import tooltipStyle from "./tooltip.module.less";

class ProgressWithScroll extends React.Component {
  timer: any = null;
  pauseUpdate: boolean = false;
  timeFlag: number = 0;
  init: boolean = false;

  update(props: any) {
    let bar: any = document.getElementById("am-progress-bar");
    let tooltip: any = document.getElementById("am-progress-tooltip");
    let tooltip_inner: any = document.getElementById(
      "am-progress-tooltip-inner",
    );

    // (() => {
    //     const timeFlag = getQueryString('timeflag', this.state.search);
    //     if (timeFlag) {
    //         this.timeFlag = parseInt(timeFlag || '');
    //     }
    // })();

    this.setState({
      start_time: props.start_time,
      end_time: props.end_time,
      frozen_time: props.frozen_time,
      search: props.search,
      history: props.history,
    });

    const setStatusAndWIdth = () => {
      const width = getWidth(props.start_time, props.end_time);
      this.setState({
        status: getStatus(props.start_time, props.end_time, props.frozen_time),
        width: width,
      });
      if (!this.pauseUpdate) {
        bar.style.left = [width, "%"].join("");
        tooltip.style.left = [width, "%"].join("");
        tooltip_inner.innerHTML = getTimeElapsed(
          props.start_time,
          props.end_time,
        );
      } else {
        // const width = getWidthByTimeFlag(props.start_time, props.end_time, this.timeFlag);
        // bar.style.left = [width, '%'].join('');
        // tooltip.style.left = [width, '%'].join('');
        // tooltip_inner.innerHTML = getTimeElapsedByTimeFLag(props.start_time, props.end_time, this.timeFlag);
      }
    };
    setStatusAndWIdth();
    this.timer && clearInterval(this.timer);
    this.timer = setInterval(() => {
      setStatusAndWIdth();
    }, 800);
  }

  componentDidMount() {
    this.update(this.props);

    (() => {
      let scroll: any = document.getElementById("am-progress-scroll");
      let mask: any = document.getElementById("am-progress-mask");
      let bar: any = document.getElementById("am-progress-bar");
      let tooltip: any = document.getElementById("am-progress-tooltip");
      let tooltip_inner: any = document.getElementById(
        "am-progress-tooltip-inner",
      );
      let barleft = 0;
      var _this = this;
      scroll.onmouseenter = function (event: any) {
        tooltip.classList.add(tooltipStyle["in"]);
      };
      scroll.onmouseleave = function (event: any) {
        tooltip.classList.remove(tooltipStyle["in"]);
      };
      bar.onmousedown = function (event: any) {
        var event = event || window.event;
        var leftVal = event.clientX - this.offsetLeft;
        var that = this;

        // 拖动一定写到 down 里面才可以
        document.onmousemove = function (event) {
          _this.pauseUpdate = true;

          tooltip.classList.add(tooltipStyle["in"]);
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
            _this.state.start_time,
            _this.state.end_time,
            width,
          );
          tooltip_inner.innerHTML = getTimeScroll(
            _this.state.start_time,
            _this.state.end_time,
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
        tooltip.classList.remove(tooltipStyle["in"]);
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
    width: 0,
    scroll_width: 0,
    search: null,
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <>
        <div
          className={[
            style["am-progress"],
            style["am-progress-striped"],
            style[progress_active[this.state.status]],
          ].join(" ")}
          style={{ marginBottom: 0, position: "relative" }}
          id={"am-progress-scroll"}
        >
          <div
            className={[
              style["am-progress-bar"],
              style[progress_status[this.state.status]],
            ].join(" ")}
            style={{ width: [this.state.width, "%"].join("") }}
            id={"am-progress-mask"}
          >
            <div
              className={[
                tooltipStyle["tooltip"],
                tooltipStyle["tooltip-top"],
              ].join(" ")}
              style={{
                marginLeft: -34,
                bottom: 22,
                left: 0,
              }}
              id={"am-progress-tooltip"}
            >
              <div
                className={[tooltipStyle["tooltip-inner"]].join(" ")}
                id={"am-progress-tooltip-inner"}
              >
                {"00:00:00"}
              </div>
            </div>

            <div
              className={[
                style["am-progress-bar"],
                style[progress_status[this.state.status]],
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
