import xlrd
from os import path
import os
import json
import time

raw_dir = "./raw"
data_dir = "../../../../data/ccpc/2020/weihai"
team_data_filename = "ccpc2020weihai.srk.json"


def json_output(data):
    return json.dumps(data, sort_keys=False, indent=4, separators=(',', ':'), ensure_ascii=False)

def json_input(path):
    with open(path, 'r') as f:
        return json.load(f)

def mkdir(_path):
    if not path.exists(_path):
        os.makedirs(_path)

def get_timestamp(dt):
    #转换成时间数组
    timeArray = time.strptime(dt, "%Y-%m-%d %H:%M:%S")
    #转换成时间戳
    timestamp = time.mktime(timeArray)
    return int(timestamp)

def output(filename, data):
    with open(path.join(data_dir, filename), 'w') as f:
        f.write(json_output(data))


def main():
    raw = json_input(path.join(raw_dir, team_data_filename))
    team = {}
    for item in raw['rows']:
        item = item['user']
        _item = {}
        _item['team_id'] = item['id']
        _item['name'] = item['name']
        _item['organization'] = item['organization']
        _item['info'] = "、".join([item['teamMembers'][i]['name'] for i in range(4)])
        if item['official'] == True:
            _item['official'] = 1
        else:
            _item['unofficial'] = 1
        if 'marker' in item.keys():
            if item['marker'] == 'female':
                _item['girl'] = 1
        team[_item['team_id']] = _item
    output("team.json", team)

        
main()