import { ContestInstance, createContestInstance } from "@/core/contest";
import { deepCopy, getJSON } from "@/utils";

import dayjs from "@/utils/dayjs";

export async function fetchData(): Promise<any> {
  const contest_list = await getJSON(
    `contest_list.json?t=${dayjs().valueOf()}`,
  );

  return contest_list;
}

export function getTreeData(contest_list: any) {
  let treeData: any;

  const dfs = (contest_list: any, path: string) => {
    let children: any = [];

    for (let k in contest_list) {
      let item: any = {};
      item["title"] = k;
      item["value"] = [path, k].join("/");
      if (!contest_list[k]["config"]) {
        children.push(item);
      }
    }

    children.forEach((children: any, index: number) => {
      children["children"] = dfs(contest_list[children.title], children.value);
    });

    return children;
  };

  treeData = [
    {
      title: "All",
      value: "",
      children: [],
    },
  ];

  treeData[0]["children"] = dfs(contest_list, "");

  return treeData;
}

export function getContestInstanceList(
  path: string,
  contest_list: any,
): ContestInstance[] {
  let contest: ContestInstance[] = [];

  const dfs = (contest_list: any, contest: any) => {
    if (!contest_list["config"]) {
      for (let k in contest_list) {
        dfs(contest_list[k], contest);
      }
    } else {
      let item = deepCopy(contest_list.config);
      item.board_link = contest_list.board_link;

      contest.push(createContestInstance(item));
    }
  };

  let _path = path.split("/");
  _path.splice(0, 1);
  let _contest_list = deepCopy(contest_list);

  _path.forEach((path: string) => {
    if (_contest_list[path] != undefined) {
      _contest_list = _contest_list[path];
    } else {
      _contest_list = null;
    }
  });

  if (_contest_list == null) {
    return contest;
  }

  dfs(_contest_list, contest);

  contest.sort((a: ContestInstance, b: ContestInstance) => {
    if (a.startTime.isBefore(b.startTime)) return 1;
    if (a.startTime.isAfter(b.startTime)) return -1;

    if (a.endTime.isBefore(b.endTime)) return 1;
    if (a.endTime.isAfter(b.endTime)) return -1;

    if (a.contest_name < b.contest_name) return 1;
    if (a.contest_name > b.contest_name) return -1;

    return 0;
  });

  return contest;
}
