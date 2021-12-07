import React, { useState, useEffect } from 'react';

import { Select, Button, Input } from 'antd';
const { Option } = Select;
const { TextArea } = Input;

import style from './Export.module.less';

import { Run } from '@/types/submission';
import { boardToDatFile, boardToJSON } from './Export.core';

export enum ExportType {
  DAT_FILE = 'dat_file',
  JSON = 'json',
}

interface ExportProps {
  contest_config: any;
  team: any;
  run: Run[];
}

const Export: React.FC<ExportProps> = (props) => {
  const [type, setType] = useState('');

  const [datFileValue, setDatFileValue] = useState('');
  const [datFileGenerateLoading, setDatFileGenerateLoading] = useState(false);

  const [rankJsonValue, setRankJsonValue] = useState('');
  const [rankJsonGenerateLoading, setRankJsonGenerateLoading] = useState(false);

  const [contestConfig, setContestConfig] = useState({} as any);
  const [team, setTeam] = useState({} as any);
  const [run, setRun] = useState([] as Run[]);

  async function onSelectChange(value: string) {
    setType(value);
  }

  useEffect(() => {
    setContestConfig(props.contest_config);
    setTeam(props.team);
    setRun(props.run);
  }, [props.contest_config, props.team, props.run]);

  async function onSelectDatFile() {
    setDatFileGenerateLoading(true);
    setDatFileValue(boardToDatFile(contestConfig, team, run));
    setDatFileGenerateLoading(false);
  }

  async function onSelectRankJson() {
    setRankJsonGenerateLoading(true);
    setRankJsonValue(JSON.stringify(boardToJSON(contestConfig, team, run)));
    setRankJsonGenerateLoading(false);
  }

  return (
    <>
      <Select
        showSearch
        style={{ width: 680, marginTop: 30 }}
        placeholder="Choose export type"
        optionFilterProp="children"
        onChange={onSelectChange}
        filterOption={(input, option) =>
          option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        <Option value={ExportType.DAT_FILE}>
          Codeforces Gym Ghosts DAT File
        </Option>
        <Option value={ExportType.JSON}>Rank JSON</Option>
      </Select>

      {type === ExportType.DAT_FILE && (
        <>
          <div style={{ width: 680, marginTop: 30 }}>
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
            onClick={onSelectDatFile}
          >
            Generate
          </Button>
        </>
      )}

      {type === ExportType.JSON && (
        <>
          <div style={{ width: 680, marginTop: 30 }}>
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
            onClick={onSelectRankJson}
          >
            Generate
          </Button>
        </>
      )}
    </>
  );
};

export { Export };
