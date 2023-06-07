import React, { useState, useEffect } from "react";
import { TreeSelect } from "antd";

import { ProgressSmall } from "@/components/Progress";
import { Loading } from "@/components/Loading";

import { GithubIcon, RightArrowIcon } from "@/icons";

import { GITHUB_URL } from "@/core/constant";
import { ContestInstance } from "@/core/contest";
import { getImageSource } from "@/core/image";

import { getTreeData, getContestInstanceList, fetchData } from "./index.core";

import style from "./index.module.less";

import { useUrlQuery } from "@/utils/hooks";

const Index: React.FC<{}> = (props) => {
  const [urlQuery, setUrlQuery] = useUrlQuery({
    path: "",
  });

  const [loading, setLoading] = useState(true);

  const [rawContestList, setRawContestList] = useState(null as any);

  const [contestInstanceList, setContestInstanceList] = useState(
    [] as ContestInstance[],
  );

  const [defaultValue, setDefaultValue] = useState("" as string);
  const [treeData, setTreeData] = useState(null as any);

  async function initData() {
    setRawContestList(await fetchData());
    setLoading(false);
  }

  useEffect(() => {
    initData();
  }, []);

  async function updateData() {
    setContestInstanceList(
      getContestInstanceList(urlQuery.path, rawContestList),
    );

    setDefaultValue(urlQuery.path);
    setTreeData(getTreeData(rawContestList));
  }

  useEffect(() => {
    updateData();
  }, [urlQuery.path, rawContestList]);

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
                href={GITHUB_URL}
                title="Github"
              >
                <span className={style["MuiIconButton-label"]}>
                  <GithubIcon />
                </span>
                <span className={style["MuiTouchRipple-root"]}></span>
              </a>
            </div>
          </div>

          {contestInstanceList.map(
            (contest: ContestInstance, index: number) => {
              return (
                <div key={contest?.board_link} className={style["m-box"]}>
                  <div
                    style={{
                      display: "flex",
                    }}
                  >
                    {contest?.logo != null && (
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
                          src={getImageSource(contest.logo)}
                          alt="logo"
                        />
                      </div>
                    )}

                    <div className={`${style["m-title"]}`}>
                      <>
                        {contest?.link?.homepage == null &&
                          contest.contest_name}

                        {contest?.link?.homepage != null && (
                          <a href={contest.link.homepage} target="_blank">
                            {contest.contest_name}
                          </a>
                        )}

                        {contest?.link?.registration != null && (
                          <sup>
                            <a href={contest.link.registration} target="_blank">
                              Register
                            </a>
                          </sup>
                        )}
                      </>
                    </div>
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
                      Start: {contest.startTime.format("YYYY-MM-DD HH:mm:ss")}
                      <sup>{contest.startTime.format("z")}</sup>
                      <br />
                      Duration:
                      {contest.getContestDuration()}
                    </div>
                    <div style={{ flex: "1" }}>
                      <div style={{ width: "72%" }}>
                        <ProgressSmall
                          startTime={contest.startTime}
                          endTime={contest.endTime}
                          frozenStartTime={contest.frozenStartTime}
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
            },
          )}
        </>
      )}
    </div>
  );
};

export default Index;
