import React from "react";
import style from "./Standings.module.less";
import starStyle from "./Star.module.less";
import { Placecharts } from "./components";
import { Loading } from "@/components/Loading";
import { deepCopy, getStarKey, removeDuplicateItems } from "@/utils/utils";
import {
  INF,
  timerInterval,
  getAnalyzeTeamId,
  getProblemList,
  getTeamList,
  getStarId,
  getStarBtnId,
  getUnStarBtnId,
  compTeamList,
} from "./Standings.services";
import { GirlIcon, LikeIcon, StarIcon } from "@/icons";
import { debounce } from "lodash";

function getInfo(coach: string | undefined, members: string[] | undefined) {
  let splitch = "、";
  let res = "";
  if (coach) res += `${coach}(教练)`;
  if (coach && members) res += splitch;
  if (members) res += members.join(splitch);
  return res;
}

function onStarBtnClick(
  team_id: number | string,
  on: boolean,
  _this: any,
  team: any,
  Filter: boolean,
) {
  if (on) {
    (() => {
      let concerned = _this.state.concerned;
      concerned.add(team_id);
      _this.setState({
        concerned: concerned,
      });
    })();
    if (team.organization_filter !== 1) {
      let team_list_filter = _this.state.team_list_filter;
      let _team = deepCopy(team);
      _team.concerned = 1;
      team_list_filter.push(_team);
      team_list_filter = (() => {
        let set = new Set();
        let res: any = [];
        team_list_filter.forEach((item: any) => {
          if (!set.has(item.team_id)) {
            set.add(item.team_id);
            res.push(item);
          }
        });
        return res;
      })();
      team_list_filter.sort(compTeamList);
      _this.setState({
        team_list_filter: team_list_filter,
      });
    }
    window.localStorage.setItem(getStarKey(team_id), "1");
  } else {
    (() => {
      let concerned = _this.state.concerned;
      concerned.delete(team_id);
      _this.setState({
        concerned: concerned,
      });
    })();
    window.localStorage.removeItem(getStarKey(team_id));
    if (Filter) {
      _this.clearTeamDetailsDisplay();
    }
    if (team.organization_filter !== 1) {
      let team_list_filter = _this.state.team_list_filter;
      team_list_filter = (() => {
        let res: any = [];
        team_list_filter.forEach((item: any) => {
          if (item.team_id !== team_id) {
            let _item = deepCopy(item);
            res.push(_item);
          }
        });
        return res;
      })();
      _this.setState({
        team_list_filter: team_list_filter,
      });
    }
  }
}

function getTeamRow(item: any, index: number, Filter: boolean, _this: any) {
  const analyzeTeamId = getAnalyzeTeamId(item.team_id, Filter ? 2 : 1);
  return (
    <>
      <tr
        className={[
          Filter
            ? style.filter
            : style[["stand", item.stand_className_id].join("")],
          style.team,
        ].join(" ")}
        onClick={() => {
          let item = document.getElementById(analyzeTeamId);
          switch (item?.style?.display) {
            case "none":
              _this.clearTeamDetailsDisplay();
              item.style.display = "";
              let vis: any = {};
              vis[analyzeTeamId] = 1;
              _this.setState({
                vis: vis,
              });
              break;
            case "":
              item.style.display = "none";
              _this.setState({
                vis: {},
              });
              break;
          }
        }}
      >
        <td className={style[item.place_className]}>{item.place}</td>
        {_this.state.badge === 1 && (
          <td className={style.empty}>
            <img
              src={["data:image/png;base64,", item.badge.base64].join("")}
              width={32}
              height={32}
              alt=""
            />
          </td>
        )}
        {_this.state.organization === 1 && (
          <td className={style.stnd}>
            <div
              style={{
                display: "flex",
              }}
            >
              <div
                style={{
                  float: "left",
                  fontFamily: "Georgia",
                  paddingLeft: 5,
                }}
              >
                {item.organization_place}
              </div>
              <div
                style={{
                  flex: "1",
                }}
              >
                {item.organization}
              </div>
              <div
                style={{
                  float: "right",
                }}
              ></div>
            </div>
          </td>
        )}
        <td className={style.stnd}>
          {item.name}
          {item.unofficial === 1 && <StarIcon />}
          <span
            className={getStarId(item.team_id)}
            style={{
              display: _this.state.concerned.has(item.team_id) ? "" : "none",
            }}
          >
            <LikeIcon />
          </span>
          {item.girl === 1 && <GirlIcon />}
        </td>

        <td className={style.stnd}>{item.solved}</td>

        <td className={style.stnd}>{item.time}</td>

        {item.problem.map((item: any, index: number) => {
          let ch_status = (() => {
            switch (item.status) {
              case "correct":
                return "+";
              case "incorrect":
                return "-";
              case "pending":
                return "?";
              case "unattempted":
                return ".";
              default:
                return ".";
            }
          })();
          return (
            <td className={style[item.status_className]}>
              {ch_status}
              {item.status === "pending" && [" ", item["pending_num"]].join("")}
              <br />
              {item.attempt_num ? parseInt(item.attempt_num) : ""}
              {_this.state.contest_config?.status_time_display[item.status] ===
                1 &&
              (item.time || item.time === 0)
                ? "/" + parseInt(item.time)
                : ""}
            </td>
          );
        })}

        <td className={style.stnd}>
          {[
            item.solved > 0
              ? Math.floor(
                  ((item.attempted - item.solved) / item.attempted) * 100,
                )
              : 0,
            "%",
          ].join("")}
        </td>
      </tr>

      <tr style={{ display: "none" }} id={analyzeTeamId}>
        <td
          colSpan={
            _this.getInfoCol() +
            _this.getProblemCol() +
            _this.getStatisticsCol()
          }
        >
          <div
            style={{
              display: "flex",
            }}
          >
            <div
              style={{
                float: "left",
                marginTop: 2,
              }}
            >
              <div
                className={[
                  getUnStarBtnId(item.team_id),
                  starStyle["star-btn"],
                ].join(" ")}
                title={`Star ${item.name}`}
                style={{
                  display: _this.state.concerned.has(item.team_id)
                    ? ""
                    : "none",
                }}
                onClick={() => {
                  onStarBtnClick(item.team_id, false, _this, item, Filter);
                }}
              >
                <svg
                  className={starStyle["octicon-star"]}
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z"
                  ></path>
                </svg>
                Unstar
              </div>
              <div
                className={[
                  getStarBtnId(item.team_id),
                  starStyle["star-btn"],
                ].join(" ")}
                title={`Star ${item.name}`}
                style={{
                  display: _this.state.concerned.has(item.team_id)
                    ? "none"
                    : "",
                }}
                onClick={() => {
                  onStarBtnClick(item.team_id, true, _this, item, Filter);
                }}
              >
                <svg
                  className={starStyle["octicon-star"]}
                  height="16"
                  viewBox="0 0 16 16"
                  version="1.1"
                  width="16"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25zm0 2.445L6.615 5.5a.75.75 0 01-.564.41l-3.097.45 2.24 2.184a.75.75 0 01.216.664l-.528 3.084 2.769-1.456a.75.75 0 01.698 0l2.77 1.456-.53-3.084a.75.75 0 01.216-.664l2.24-2.183-3.096-.45a.75.75 0 01-.564-.41L8 2.694v.001z"
                  ></path>
                </svg>
                Star
              </div>

              {(item.coach || item.members) && (
                <span
                  style={{
                    paddingLeft: "10px",
                  }}
                >
                  {getInfo(item.coach, item.members)}
                </span>
              )}
            </div>
          </div>

          {_this.state.vis[analyzeTeamId] === 1 && (
            <>
              <Placecharts
                contest_config={_this.state.contest_config}
                cur_team={item}
                team={_this.state.team}
                run={_this.state.run}
              />
            </>
          )}
        </td>
      </tr>
    </>
  );
}

function getTeamRowFilter(item: any, index: number) {
  return getTeamRow(item, index, true, this);
}

function getTeamRowAll(item: any, index: number) {
  return getTeamRow(item, index, false, this);
}

class Standings extends React.Component {
  timer: any = null;

  clearTimer() {
    this.timer && clearTimeout(this.timer);
  }

  clearTeamDetailsDisplay() {
    for (let key in this.state.vis) {
      let item = document.getElementById(key);
      switch (item?.style?.display) {
        case "":
          item.style.display = "none";
          break;
      }
    }
    this.setState({
      vis: {},
    });
  }

  update(props: any) {
    let problem_list = getProblemList(props.contest_config, props.run);

    let team_list = getTeamList(
      props.contest_config,
      props.team,
      props.run,
      problem_list,
    );

    let concerned = (() => {
      let concerned = new Set();
      team_list.forEach((team: any) => {
        if (team.concerned === 1) {
          concerned.add(team.team_id);
        }
      });
      return concerned;
    })();

    this.setState({
      problem_list: problem_list,
      team_list: team_list,
      contest_config: props.contest_config,
      team_list_filter: team_list.filter((x) => x.filter === 1),
      team: props.team,
      run: props.run,
      organization: props.contest_config?.organization ? 1 : 0,
      badge: props.contest_config?.badge ? 1 : 0,
      loaded: true,
      filter: props.filter,
      concerned: concerned,
    });
  }

  getInfoCol() {
    return 4 + this.state.organization + this.state.badge;
  }

  getProblemCol() {
    return this.state.contest_config?.problem_id?.length;
  }

  getStatisticsCol() {
    return 1;
  }

  componentWillMount() {
    debounce(this.update, timerInterval).bind(this)(this.props);
  }

  componentDidMount() {}

  //props中的值发生改变时执行
  componentWillReceiveProps(nextProps: any) {
    if (this.props?.currentGroup !== nextProps?.currentGroup) {
      this.setState({ loaded: false });
      debounce(this.update, timerInterval).bind(this)(nextProps);
    } else {
      this.update(nextProps);
    }
  }

  //组件卸载前的操作
  componentWillUnmount() {
    this.clearTimer();
  }

  constructor(props: any) {
    super(props);
  }

  state = {
    contest_config: {},
    team: {},
    run: [],
    problem_list: [],
    team_list: [],
    team_list_filter: [],
    organization: 0,
    badge: 0,
    vis: {},
    loaded: false,
    filter: true,
    concerned: new Set(),
  };

  render() {
    return (
      <>
        {this.state.loaded === false && (
          <div className={style.loading}>
            <Loading />
          </div>
        )}

        {this.state.loaded === true && (
          <table style={{ marginTop: "5px" }} className={style.standings}>
            <thead>
              <tr>
                <th className={style.title} style={{ width: "3em" }}>
                  Place
                </th>
                {this.state.badge === 1 && (
                  <th className={style.title} style={{ width: "3em" }}>
                    {this.state.contest_config.badge}
                  </th>
                )}
                {this.state.organization === 1 && (
                  <th className={style.title} style={{ minWidth: "12em" }}>
                    {this.state.contest_config.organization}
                  </th>
                )}
                <th className={style.title} style={{ minWidth: "12em" }}>
                  Team
                </th>
                <th className={style.title} style={{ width: "3em" }}>
                  Solved
                </th>
                <th className={style.title} style={{ width: "3em" }}>
                  Time
                </th>
                {this.state.problem_list.map((item: any, index: number) => {
                  return (
                    <th
                      className={style.success}
                      style={{
                        width: "4em",
                        backgroundColor:
                          item.balloon_color?.background_color || "",
                        color: item.balloon_color?.color || "",
                      }}
                    >
                      {[this.state.contest_config.problem_id[item.problem_id]]}
                      <br />
                      <s>{item.solved}</s>
                    </th>
                  );
                })}

                <th className={style.title} style={{ width: "3em" }}>
                  Dirt
                </th>
              </tr>
            </thead>
            <tbody>
              {this.state.filter === false &&
                this.state.team_list_filter.map(getTeamRowFilter.bind(this))}

              {this.state.team_list.map(getTeamRowAll.bind(this))}

              {[
                {
                  title: "Attempted",
                  calc: (item: any, index: number) => {
                    return (
                      <td className={style.stnd}>
                        <b>{item.total}</b>
                      </td>
                    );
                  },
                },
                {
                  title: "Accepted",
                  calc: (item: any, index: number) => {
                    return (
                      <td className={style.stnd}>
                        <b>{item.solved}</b>
                        <br />
                        <b>
                          ({Math.round((item.solved / item.total) * 100)}
                          {item.total === 0 ? "" : "%"})
                        </b>
                      </td>
                    );
                  },
                },
                {
                  title: "Dirt",
                  calc: (item: any, index: number) => {
                    return (
                      <td className={style.stnd}>
                        <b>{item.attempted - item.solved}</b>
                        <br />
                        <b>
                          (
                          {item.attempted === 0
                            ? "0%"
                            : [
                                Math.round(
                                  ((item.attempted - item.solved) /
                                    item.attempted) *
                                    100,
                                ),
                                "%",
                              ].join("")}
                          )
                        </b>
                      </td>
                    );
                  },
                },
                {
                  title: "First Solved",
                  calc: (item: any, index: number) => {
                    return (
                      <td className={style.stnd}>
                        <b>
                          {item.first_solve_time === INF
                            ? "N/A"
                            : item.first_solve_time}
                        </b>
                      </td>
                    );
                  },
                },
                {
                  title: "Last Solved",
                  calc: (item: any, index: number) => {
                    return (
                      <td className={style.stnd}>
                        <b>
                          {item.last_solve_time === 0
                            ? "N/A"
                            : item.last_solve_time}
                        </b>
                      </td>
                    );
                  },
                },
              ].map((item: any, index: number) => {
                return (
                  <tr className={style[["statistics", index % 2].join("-")]}>
                    <td
                      className={style.empty}
                      colSpan={this.getInfoCol() - 1}
                    ></td>
                    <td className={style.stnd}>
                      <b>{item.title}</b>
                    </td>
                    {this.state.problem_list.map(item.calc)}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </>
    );
  }
}

export { Standings };
