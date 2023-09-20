import React from "react";
import style from "./SecondLevelMenu.module.less";
import { getQueryParams } from "@/utils";

class SecondLevelMenu extends React.Component {
  update(props: any) {
    this.setState({
      search: props.search,
      history: props.history,
      queryName: props.queryName || "",
      siderItem: props.siderItem || [],
      currentItem: props.currentItem || "",
    });
  }

  componentDidMount() {
    this.update(this.props);
  }

  async componentWillReceiveProps(nextProps: any) {
    this.update(nextProps);
  }

  constructor(props: any) {
    super(props);
  }

  state = {
    search: null,
    history: {},
    queryName: "",
    siderItem: [],
    currentItem: "",
  };

  changeTab = (tab: string, _this: any) => {
    const query = getQueryParams(
      _this.state.queryName,
      tab,
      _this.props.search,
    );
    const pathname = window.location.pathname;
    _this.state.history.push({
      pathname: pathname,
      query: query,
    });
  };

  render() {
    return (
      <div className={style["second-level-menu-list"]}>
        {this.state.siderItem.map((item: any, index: any) => {
          return (
            <div
              key={index}
              className={[
                style["second-level-menu-item"],
                item == this.state.currentItem
                  ? style["second-level-menu-item-current"]
                  : "",
              ].join(" ")}
              onClick={() => this.changeTab(item, this)}
            >
              {item}
            </div>
          );
        })}
      </div>
    );
  }
}

export { SecondLevelMenu };
