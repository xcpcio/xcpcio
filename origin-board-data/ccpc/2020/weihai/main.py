import xlrd
from os import path
import os
import json
import time

def json_output(data):
    return json.dumps(data, sort_keys=False, indent=4, separators=(',', ':'), ensure_ascii=False)

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

raw_dir = "raw"
data_dir = "../../../../data/ccpc/2020/weihai"
team_data_filename = "2020CCPC威海站队伍信息.xlsx"
qhd_data_filename = "CCPC2020-女生赛-正式参赛队榜单-原始.xlsx"
problem_num = 12
problem_id = [chr(ord('A') + i) for i in range(problem_num)] 
medal = {
    'all': {
        'gold': 24,
        'silver': 48,
        "bronze": 72
    }
}
group = {
    'official': '正式队伍',
    'unofficial': '打星参赛',
    'inside': '晋级参赛',
    'outside': '外卡参赛',
    'girl': '女队',

}
school = {
    'name': 1,
}
status_time = {
    'correct': 1,
}
config = {
    'contest_name': 'CCPC2020-第六届中国大学生程序设计竞赛（威海） 正式赛',
    'start_time': get_timestamp("2020-10-25 09:00:00"),
    'end_time': get_timestamp("2020-10-25 14:00:00"),
    'frozen_time' : 0,
    'problem_id': problem_id,
    # 'medal': medal,
    'group': group,
    'school': school,
    'status_time': status_time,
    'penalty': 20 * 60,
}

def config_out():
    output("config.json", config)
    
def team_out():
    data = xlrd.open_workbook(path.join(raw_dir, team_data_filename)) 
    sheet = data.sheet_by_index(0)
    nrows = sheet.nrows
    team = {}
    for i in range(1, nrows):
        row = sheet.row_values(i)
        team[row[0]] = {}
        team_now = team[row[0]]
        team_now['school'] = row[1]
        team_now['name'] = row[3]
        if row[12] == '晋级参赛' or row[12] == '外卡参赛':
            team_now['official'] = 1
        if row[12] == '女队参赛':
            team_now['girl'] = 1
        if row[12] == '晋级参赛':
            team_now['inside'] = 1
        if row[12] == '外卡参赛':
            team_now['outside'] = 1
        if row[12] == '打星参赛':
            team_now['unofficial'] = 1
    output("team.json", team)
        
def run_out():
    data = xlrd.open_workbook(path.join(raw_dir, qhd_data_filename))
    sheet = data.sheet_by_index(0)
    nrows = sheet.nrows
    result = []
    for i in range(2, nrows):
        row = sheet.row_values(i)
        team_id = row[2].split('_')[0]
        # team_id
        # problem_id
        # timestamp
        # status [correct, incorrect, pending]
        base = 5
        for j in range(problem_num):
            item = row[base + j]
            res_item = {}
            res_item['problem_id'] = j
            res_item['team_id'] = team_id
            if item == '-':
                pass
            elif item[0] == '-':
                res_item['timestamp'] = config['end_time'] - config['start_time']
                res_item['status'] = 'incorrect'
                for k in range(int(item.split('-')[1])):
                    result.append(res_item)
            elif item[0] == '+':
                res_item['status'] = 'incorrect'
                res_item['timestamp'] = int(item.split('\n')[1]) * 60
                attempt_num = item.split('\n')[0].split('+')[1]
                if len(attempt_num) > 0:
                    for k in range(int(attempt_num)):
                        result.append(res_item.copy())
                _res_item = res_item.copy()
                _res_item['status'] = 'correct'
                result.append(_res_item)

    output("run.json", result)

mkdir(data_dir)
config_out()
team_out()
# run_out()