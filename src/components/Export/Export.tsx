import React, { useState, useEffect } from "react";

import { Select, Button, Input } from "antd";
const { Option } = Select;
const { TextArea } = Input;

import { deepCopy, getDisplayTime } from "@/utils";
import style from "./Export.module.less";

interface RankTeam {
  members?: string;
  organization?: string;
  name?: string;
  place?: any;
}

interface ExportProps {
  contest_config: any;
  team: any;
  run: any;
}

const Export: React.FC<ExportProps> = (props) => {
  const [type, setType] = useState("");

  const [datFileValue, setDatFileValue] = useState("");
  const [datFileGenerateLoading, setDatFileGenerateLoading] = useState(false);

  const [rankJsonValue, setRankJsonValue] = useState("");
  const [rankJsonGenerateLoading, setRankJsonGenerateLoading] = useState(false);

  const [contestConfig, setContestConfig] = useState({} as any);
  const [team, setTeam] = useState({} as any);
  const [run, setRun] = useState([] as any);

  async function onSelectChange(value: string) {
    setType(value);
  }

  useEffect(() => {
    setContestConfig(props.contest_config);
    setTeam(props.team);
    setRun(props.run);
  }, [props.contest_config, props.team, props.run]);

  async function getDatFile() {
    setDatFileGenerateLoading(true);

    let datFile = "";

    datFile += `@contest "${contestConfig.contest_name}"
@contlen ${getDisplayTime(contestConfig.end_time - contestConfig.start_time)}
@problems ${contestConfig.problem_id.length}
@teams ${Object.keys(team).length}
@submissions ${run.length}
`;

    contestConfig.problem_id.forEach((pid: string) => {
      datFile += `@p ${pid},${pid},20,0\n`;
    });

    let { team_new_id, team_problem_submit_index } = (() => {
      let team_new_id: any = {};
      let team_problem_submit_index: any = {};
      let pos = 1;
      const initP = () => {
        return contestConfig.problem_id.map((name: string, index: number) => {
          return 0;
        });
      };
      for (let tid in team) {
        team_new_id[tid] = pos;
        ++pos;
        team_problem_submit_index[tid] = initP();
      }
      return { team_new_id, team_problem_submit_index };
    })();

    for (let tid in team) {
      datFile += `@t ${team_new_id[tid]},0,1,${team[tid].name}\n`;
    }

    run.forEach((run: any) => {
      let status = "";
      if (run.status === "correct") status = "OK";
      if (run.status === "incorrect") status = "WA";
      if (run.status === "pending") status = "PD";
      ++team_problem_submit_index[run.team_id][run.problem_id];
      datFile += `@s ${team_new_id[run.team_id]},${
        contestConfig.problem_id[run.problem_id]
      },${team_problem_submit_index[run.team_id][run.problem_id]},${
        run.timestamp
      },${status}\n`;
    });

    setDatFileValue(datFile);
    setDatFileGenerateLoading(false);
  }

  async function getRankJson() {
    setRankJsonGenerateLoading(true);

    let teamJson: RankTeam[] = [];
    let _team = deepCopy(team);

    const penalty = contestConfig.penalty;

    for (let k in _team) {
      _team[k]["problem"] = contestConfig.problem_id.map(() => 0);
      _team[k]["solved"] = 0;
      _team[k]["time"] = 0;
    }

    run.forEach((run: any) => {
      if (run.status === "correct") {
        _team[run.team_id].solved += 1;
        _team[run.team_id].time +=
          run.timestamp + penalty * _team[run.team_id].problem[run.problem_id];
      } else {
        _team[run.team_id].problem[run.problem_id] += 1;
      }
    });

    let teamList = [];
    for (let k in _team) {
      teamList.push(_team[k]);
    }

    teamList.sort((a: any, b: any) => {
      if (a.solved > b.solved) return -1;
      if (a.solved < b.solved) return 1;
      if (a.time < b.time) return -1;
      if (a.time > b.time) return 1;
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    teamList.forEach((team: any, index: number) => {
      let item: RankTeam = {};
      item.members = team.members || [];
      item.organization = team.organization || "";
      item.name = team.name || "";
      item.place = {};
      item.place["all"] = index + 1;
      teamJson.push(item);
    });
    let rankJson: any = {};
    rankJson["contestName"] = contestConfig["contest_name"];
    rankJson["teams"] = teamJson;

    setRankJsonValue(JSON.stringify(rankJson));
    setRankJsonGenerateLoading(false);
  }

  return (
    <>
      <Select
        showSearch
        style={{ width: 680, marginTop: 30 }}
        placeholder="Select a type"
        optionFilterProp="children"
        onChange={onSelectChange}
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Option value="dat-file">Codeforces Gym Ghosts DAT File</Option>
        <Option value="rank-json">Rank JSON</Option>
      </Select>

      <br />
      <br />

      {type === "dat-file" && (
        <>
          <div style={{ width: 680 }}>
            <TextArea
              allowClear={true}
              rows={15}
              defaultValue={datFileValue}
              key={datFileValue}
              disabled={datFileGenerateLoading}
            />
          </div>
          <br />
          <Button
            loading={datFileGenerateLoading}
            className={style.btn}
            type="primary"
            size="small"
            onClick={getDatFile}
          >
            Generate
          </Button>
        </>
      )}

      {type === "rank-json" && (
        <>
          <div style={{ width: 680 }}>
            <TextArea
              allowClear={true}
              rows={15}
              defaultValue={rankJsonValue}
              key={rankJsonValue}
              disabled={rankJsonGenerateLoading}
            />
          </div>
          <br />
          <Button
            loading={rankJsonGenerateLoading}
            className={style.btn}
            type="primary"
            size="small"
            onClick={getRankJson}
          >
            Generate
          </Button>
        </>
      )}
    </>
  );
};

export { Export };
