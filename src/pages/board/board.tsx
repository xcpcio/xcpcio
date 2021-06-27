import React from "react";
import { Loading } from "@/components/Loading";
import { ProgressBig } from "@/components/Progress";
import { SecondLevelMenu } from "@/components/SecondLevelMenu";
import { Standings } from "@/components/Standings";
import { Statistics } from "@/components/Statistics";
import { Selected } from "@/components/Selected";
import standingsStyle from "@/components/Standings/Standings.module.less";
import style from "./board.module.less";
import {
  fetchIntervalTime,
  fetchData,
  getMenu,
  getCurrentGroup,
  getTimeFlag,
  getOrganization,
  getCurrentOrganization,
  getConfig,
  getRun,
  getTeam,
} from "./board.services";
import { throttle, debounce } from "lodash";
import __CONFIG__ from "@/../config";
import { Balloon } from "@/components/Balloon";
import { Export } from "@/components/Export";
import { Run } from "@/interface/submission";

const head_item = [
  <table>
    <tbody>
      <tr>
        <td className={standingsStyle.gold}>Gold</td>
        <td className={standingsStyle.silver}>Silver</td>
        <td className={standingsStyle.bronze}>Bronze</td>
        <td className={standingsStyle.honorable}>Honorable</td>
        <td className={standingsStyle.firstsolve}>First to solve problem</td>
        <td className={standingsStyle.correct}>Solved problem</td>
        <td className={standingsStyle.incorrect}>Attempted problem</td>
        <td className={standingsStyle.pending}>Pending judgement</td>
      </tr>
    </tbody>
  </table>,
  <></>,
  <></>,
];

class Board extends React.Component {
  contest_config: any = null;
  team: any = null;
  run: any = null;
  timer: any = null;

  fetchThrottled: any = null;

  clearTimer() {
    this.timer && clearTimeout(this.timer);
  }

  async fetch() {
    let { contest_config, team, run } = await fetchData();
    if (contest_config !== null && team !== null) {
      this.contest_config = contest_config;
      this.team = team;
      this.run = run;
    }
  }

  async update(props: any) {
    if (this.state.loaded) {
      await this.fetchThrottled();
    } else {
      if (this.timer == null) {
        await this.fetch();
      } else {
        await this.fetchThrottled();
      }
    }

    if (this.contest_config === null || this.team === null) {
      this.clearTimer();
      this.timer = setTimeout(() => {
        this.update(props);
      }, 1000);
      return;
    }

    document.title = this.contest_config?.contest_name;

    for (let team_id in this.team) {
      this.team[team_id]["all"] = 1;
    }

    const { menu_item, fgroup } = getMenu(this.contest_config);

    let menu_index = (() => {
      let menu_index: any = {};
      const params = new URLSearchParams(props.location.search);
      for (let key in menu_item) {
        if (params.get(key)) {
          menu_index[key] = menu_item[key].indexOf(params.get(key));
          if (menu_index[key] === -1) menu_index[key] = 0;
        } else {
          menu_index[key] = 0;
        }
      }
      return menu_index;
    })();

    const timeFlag = getTimeFlag(this.contest_config, props.location.search);

    const currentGroup = getCurrentGroup(
      props.location.search,
      menu_item.group,
      fgroup,
    );

    const { current_contest_config, current_team, current_run } = (() => {
      const current_contest_config = getConfig(
        this.contest_config,
        currentGroup,
      );
      const current_team = getTeam(
        this.team,
        currentGroup,
        props.location.search,
      );
      const current_run = getRun(this.run, current_team, timeFlag);
      return { current_contest_config, current_team, current_run };
    })();

    this.setState({
      contest_config: this.contest_config,
      team: this.team,
      run: this.run,
      current_contest_config: current_contest_config,
      current_team: current_team,
      current_run: current_run,
      timeFlag: timeFlag,
      menu_item: menu_item,
      fgroup: fgroup,
      menu_index: menu_index,
      loaded: true,
      filter: currentGroup === "filter" ? true : false,
    });

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.update(props);
    }, fetchIntervalTime);
  }

  async componentWillMount() {
    await this.update(this.props);
  }

  async componentDidMount() {}

  //props中的值发生改变时执行
  async componentWillReceiveProps(nextProps: any) {
    if (
      this.props.location?.pathname !== nextProps.location?.pathname ||
      this.props.location?.search !== nextProps.location?.search
    ) {
      await this.update(nextProps);
    }
  }

  shouldComponentUpdate(nextProps: any, nextState: any) {
    return true;
  }

  componentWillUnmount() {
    this.clearTimer();
  }

  constructor(props: any) {
    super(props);
    this.fetchThrottled = throttle(this.fetch, fetchIntervalTime);
  }

  state = {
    contest_config: {},
    team: {},
    run: [],
    current_contest_config: {},
    current_team: {},
    current_run: [],
    timeFlag: 0,
    loaded: false,
    menu_item: {},
    fgroup: [],
    menu_index: {
      type: 0,
      group: 0,
    },
    tab: 0,
    filter: false,
    title: __CONFIG__.title,
  };

  render() {
    return (
      <div className={style.root}>
        {this.state.loaded === false && (
          <div className={style.loading}>
            <Loading />
          </div>
        )}

        {this.state.loaded === true && (
          <>
            {this.state.contest_config?.banner !== undefined && (
              <div className={style.banner}>
                <img
                  className={style["banner-img"]}
                  src={[
                    "data:image/png;base64,",
                    this.state.contest_config.banner.base64,
                  ].join("")}
                  alt="banner"
                ></img>
              </div>
            )}

            {this.state.contest_config?.banner === undefined && (
              <div className={style.title}>
                {this.state.contest_config?.contest_name}
              </div>
            )}

            <ProgressBig
              head_item={head_item[this.state.menu_index.type]}
              start_time={this.state.contest_config?.start_time}
              end_time={this.state.contest_config?.end_time}
              frozen_time={this.state.contest_config?.frozen_time}
              search={this.props.location.search}
              history={this.props.history}
            />

            <br />

            <div style={{ display: "flex" }}>
              <div style={{ float: "left" }}>
                <SecondLevelMenu
                  search={this.props.location.search}
                  history={this.props.history}
                  queryName={"group"}
                  siderItem={this.state.menu_item.group}
                  currentItem={
                    this.state.menu_item.group[this.state.menu_index.group]
                  }
                />
              </div>

              {this.state.contest_config?.organization && (
                <div style={{ flex: "1", maxWidth: "480px" }}>
                  <Selected
                    placeholder={[
                      this.state.contest_config.organization,
                      "Filter",
                    ].join(" ")}
                    search={this.props.location.search}
                    history={this.props.history}
                    queryName={"organization"}
                    selectedItem={getOrganization(this.state.team)}
                    currentSelected={getCurrentOrganization(
                      this.props.location.search,
                    )}
                  />
                </div>
              )}

              <div style={{ flex: "1" }}></div>
              <div style={{ float: "right" }}>
                <SecondLevelMenu
                  search={this.props.location.search}
                  history={this.props.history}
                  queryName={"type"}
                  siderItem={this.state.menu_item.type.slice().reverse()}
                  currentItem={
                    this.state.menu_item.type[this.state.menu_index.type]
                  }
                />
              </div>
            </div>

            {this.state.menu_index.type === 0 && (
              <Standings
                contest_config={this.state.current_contest_config}
                team={this.state.current_team}
                run={this.state.current_run}
                currentGroup={this.state.menu_index.group}
                filter={this.state.filter}
              />
            )}

            {this.state.menu_index.type === 1 && (
              <Balloon
                contest_config={this.state.current_contest_config}
                team={this.state.current_team}
                run={this.state.current_run}
              />
            )}

            {this.state.menu_index.type === 2 && (
              <Statistics
                contest_config={this.state.current_contest_config}
                team={this.state.current_team}
                run={this.state.current_run}
              />
            )}

            {this.state.menu_index.type === 3 && (
              <Export
                contest_config={this.state.current_contest_config}
                team={this.state.current_team}
                run={this.state.current_run}
              />
            )}
          </>
        )}
      </div>
    );
  }
}

export default Board;
