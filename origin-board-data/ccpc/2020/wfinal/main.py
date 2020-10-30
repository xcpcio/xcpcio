import xlrd
from os import path
import os
import json
import time

def json_output(data):
    return json.dumps(data, sort_keys=True, indent=4, separators=(',', ':'), ensure_ascii=False)

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
data_dir = "../../../../data/ccpc/2020/wfinal"
team_data_filename = "CCPC2020-参赛队伍数据.xlsx"
qhd_data_filename = "CCPC2020-女生赛-正式参赛队榜单-原始.xlsx"
problem_num = 12
problem_id = [chr(ord('A') + i) for i in range(problem_num)] 
medal = {
    'all': {
        'gold': 16,
        'silver': 31,
        "bronze": 47
    }
}
group = {
    'official': '正式队伍',
    'unofficial': '打星队伍',
    'girl': '女队',
}
status_time_display = {
    'correct': 1,
}
config = {
    'contest_name': 'CCPC2020-第六届中国大学生程序设计竞赛女生专场 正式赛',
    'start_time': get_timestamp("2020-10-18 09:00:00"),
    'end_time': get_timestamp("2020-10-18 14:00:00"),
    'frozen_time' : 60 * 60,
    'problem_id': problem_id,
    'medal': medal,
    # 'group': group,
    'organization': 'School',
    'status_time_display': status_time_display,
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
        if row[0] == '女生赛' and row[4] == '女生赛队伍':
            team[row[1]] = {}
            team_now = team[row[1]]
            team_now['organization'] = row[2]
            team_now['name'] = row[3].split('_')[-1]
            if row[4] == "女生赛队伍":
                team_now['official'] = 1
            if row[4] == "打星队伍":
                team_now['unofficial'] = 1
    output("team.json", team)
        
def result_out():
    data = xlrd.open_workbook(path.join(raw_dir, qhd_data_filename))
    sheet = data.sheet_by_index(0)
    nrows = sheet.nrows
    result = {}
    for i in range(2, nrows):
        row = sheet.row_values(i)
        team_id = row[2].split('_')[0]
        result[team_id] = {}
        result_now = result[team_id]
        result_now['solved'] = int(row[3])
        result_now['time'] = int(row[4])
        result_now['detail'] = []
        detail = result_now['detail']
        # id
        # attempt_num
        # status
        # time
        base = 5
        for j in range(problem_num):
            item = row[base + j]
            problem_res = {}
            problem_res['problem_id'] = problem_id[j]
            if item == '-':
                problem_res['status'] = 'unattempted'
            elif item[0] == '-':
                problem_res['status'] = 'incorrect'
                problem_res['attempt_num'] = int(item.split('-')[1])
            elif item[0] == '+':
                problem_res['status'] = 'correct'
                problem_res['time'] = int(item.split('\n')[1])
                attempt_num = item.split('\n')[0].split('+')[1]
                if len(attempt_num) > 0:
                    problem_res['attempt_num'] = int(attempt_num)
                else:
                    problem_res['attempt_num'] = 1
            detail.append(problem_res)

    output("result.json", result)
        
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
run_out()