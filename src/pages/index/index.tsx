import React, { useState, useEffect } from "react";
import { TreeSelect } from "antd";
import { useHistory } from "umi";

import { ProgressSmall } from "@/components/Progress";
import { Loading } from "@/components/Loading";

import { GithubIcon, RightArrowIcon } from "@/icons";

import style from "./index.module.less";

import {
  getTreeData,
  getContest,
  getDuration,
  fetchData,
} from "./index.services";

import { timeFormat } from "@/utils";
import { useUrlQuery } from "@/utils/hooks";

const Index: React.FC<{}> = (props) => {
  const history = useHistory();

  const [loading, setLoading] = useState(true);

  const [contest, setContest] = useState([] as any);
  const [defaultValue, setDefaultValue] = useState("" as any);
  const [treeData, setTreeData] = useState(null as any);
  const [contestList, setContestList] = useState(null as any);

  const [urlQuery, setUrlQuery] = useUrlQuery({
    path: "",
  });

  async function updateData() {
    setContest(getContest(urlQuery.path, contestList));
    setDefaultValue(urlQuery.path);
    setTreeData(getTreeData(contestList));
  }

  async function initData() {
    setContestList(await fetchData());
    setLoading(false);
  }

  useEffect(() => {
    initData();
  }, []);

  useEffect(() => {
    updateData();
  }, [urlQuery.path, contestList]);

  async function onSelectChange(value: string) {
    setUrlQuery({
      path: value,
    });
  }

  return (
    <div className={style.root}>
      {loading === true && (
        <div className={style.loading}>
          <Loading />
        </div>
      )}

      {loading === false && (
        <>
          <div
            className={style["border-bottom"]}
            style={{ display: "flex", marginTop: "20px" }}
          >
            <div style={{ float: "left" }}>
              <TreeSelect
                style={{ width: "740px" }}
                value={defaultValue}
                dropdownStyle={{
                  maxHeight: 680,
                  overflow: "auto",
                }}
                treeData={treeData}
                placeholder="Please select"
                key={defaultValue}
                defaultValue={defaultValue}
                showCheckedStrategy={TreeSelect.SHOW_PARENT}
                treeDefaultExpandAll
                onChange={onSelectChange}
              />
            </div>
            <div style={{ flex: "1" }}></div>
            <div style={{ float: "right" }}>
              <a
                className={[
                  style.go,
                  style["MuiButtonBase-root"],
                  style["MuiIconButton-root"],
                ].join(" ")}
                target="_blank"
                rel="noreferrer"
                href="https://github.com/XCPCIO/XCPCIO-Board"
                title="Github"
              >
                <span className={style["MuiIconButton-label"]}>
                  <GithubIcon />
                </span>
                <span className={style["MuiTouchRipple-root"]}></span>
              </a>
            </div>
          </div>

          {contest.map((contest: any, index: number) => {
            return (
              <div key={index} className={style["m-box"]}>
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  {contest?.logo?.base64 != null && (
                    <div
                      style={{
                        float: "left",
                        textAlign: "left",
                        fontSize: "16px",
                        paddingTop: 12,
                        paddingRight: 8,
                      }}
                    >
                      <img
                        width="40"
                        height="40"
                        src={[
                          "data:image/png;base64,",
                          contest?.logo?.base64,
                        ].join("")}
                        alt=""
                      />
                    </div>
                  )}

                  {contest?.link?.homepage != null && (
                    <div className={`${style["m-title"]}`}>
                      <a href={contest.link.homepage} target="_blank">
                        {contest.contest_name}
                      </a>
                    </div>
                  )}

                  {contest?.link?.homepage == null && (
                    <div className={style["m-title"]}>
                      {contest.contest_name}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    paddingBottom: "0px",
                  }}
                >
                  <div
                    style={{
                      float: "left",
                      textAlign: "left",
                      fontSize: "16px",
                    }}
                  >
                    Start: {timeFormat(contest.start_time)}
                    <br />
                    Duration:
                    {getDuration(contest.start_time, contest.end_time)}
                  </div>
                  <div style={{ flex: "1" }}>
                    <div style={{ width: "72%" }}>
                      <ProgressSmall
                        start_time={contest.start_time}
                        end_time={contest.end_time}
                        frozen_time={contest.frozen_time}
                      />
                    </div>
                  </div>
                  <div style={{ float: "right" }}>
                    <a
                      className={[
                        style.go,
                        style["MuiButtonBase-root"],
                        style["MuiIconButton-root"],
                      ].join(" ")}
                      target="_blank"
                      rel="noreferrer"
                      href={contest?.board_link}
                      style={{}}
                    >
                      <span className={style["MuiIconButton-label"]}>
                        <RightArrowIcon />
                      </span>
                      <span className={style["MuiTouchRipple-root"]}></span>
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};

export default Index;
