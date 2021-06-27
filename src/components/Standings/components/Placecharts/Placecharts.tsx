import { Loading } from "@/components/Loading";
import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import style from "./Placecharts.module.less";
import {
  height,
  timerInterval,
  getHichartsOptions,
} from "./Placecharts.services";
import { debounce } from "lodash";

class Placecharts extends React.Component {
  async update(props: any) {
    const options = getHichartsOptions(
      props.contest_config,
      props.cur_team,
      props.team,
      props.run,
    );
    this.setState({
      loaded: true,
      options: options,
    });
  }

  //在组件已经被渲染到 DOM 中后运行
  async componentWillMount() {
    debounce(this.update, timerInterval).bind(this)(this.props);
  }

  //props中的值发生改变时执行
  async componentWillReceiveProps(nextProps: any) {
    debounce(this.update, timerInterval).bind(this)(nextProps);
  }

  //组件卸载前的操作
  componentWillUnmount() {}

  state = {
    loaded: false,
    options: {},
  };

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <>
        {this.state.loaded === false && (
          <div
            className={style.loading}
            style={{
              height: height,
            }}
          >
            <Loading />
          </div>
        )}

        {this.state.loaded === true && (
          <HighchartsReact
            style={{
              height: { height },
            }}
            highcharts={Highcharts}
            options={this.state.options}
          />
        )}
      </>
    );
  }
}

export { Placecharts };
