import requests
import json
import grequests
from os import path
import time

def json_output(data):
    return json.dumps(data, sort_keys=False, indent=4, separators=(',', ':'), ensure_ascii=False)

def output(filename, data):
    with open(path.join(data_dir, filename), 'w') as f:
        f.write(json_output(data))

def json_input(path):
    with open(path, 'r') as f:
        return json.load(f)

def get_now():
    return int(round(time.time() * 1000))

def get_timestamp(dt):
    #转换成时间数组
    timeArray = time.strptime(dt, "%Y-%m-%d %H:%M:%S")
    #转换成时间戳
    timestamp = time.mktime(timeArray)
    return int(round(timestamp * 1000))

def get_time_diff(l, r):
    return int((r - l) // 1000)

_params = json_input('params.json')

headers = _params['headers']
data_dir = _params['data_dir']
board_url = _params['board_url']
start_time = get_timestamp(_params['start_time'])
end_time = get_timestamp(_params['end_time'])
contest_id = _params['contest_id']
print(start_time)
print(end_time)

def fetch():
    total = 0
    while True:
        params = (
            ('token', ''),
            ('id', contest_id),
            ('limit', '0'),
            ('_', get_now()),
        )
        response = requests.get(board_url, headers=headers, params=params)
        res = json.loads(response.text)
        if res['code'] == 0:
            total = res['data']['basicInfo']['pageCount']
            break
    print(total)

    req_list = []

    for i in range(1, total + 1):
        params = (
            ('token', ''),
            ('id', contest_id),
            ('limit', '0'),
            ('_', get_now()),
            ('page', str(i)),
        )
        req_list.append(grequests.get(board_url, headers=headers, params=params))

    res_list = grequests.map(req_list)
    return res_list

def team_output(res_list):
    teams = {}
    for item in res_list:
        item = json.loads(item.text)
        item = item['data']
        for team in item['rankData']:
            team_id = team['uid']
            team_name = team['userName']
            team_organization = '---'
            if 'school' in team.keys():
                team_organization = team['school']
            _team = {}
            _team['name'] = team_name
            _team['organization'] = team_organization
            _team['official'] = 1
            teams[team_id] = _team
    if len(teams.keys()) > 0:
        output("team.json", teams)
                    
def run_output(res_list):
    run = []
    for item in res_list:
        item = json.loads(item.text)
        item = item['data']
        for team in item['rankData']:
            team_id = team['uid']
            i = -1
            for problem in team['scoreList']:
                timestamp = get_time_diff(start_time, min(end_time, get_now()))
                i += 1
                status = 'incorrect'
                if problem['accepted']:
                    status = 'correct'
                    timestamp = get_time_diff(start_time, int(problem['acceptedTime']))
                cnt = problem['failedCount']
                for j in range(0, cnt):
                    run_ = {
                        'team_id': team_id,
                        'timestamp': timestamp,
                        'problem_id': i,
                        'status': 'incorrect'
                    }
                    run.append(run_)
                if status == 'correct':
                    run_ = {
                        'team_id': team_id,
                        'timestamp': timestamp,
                        'problem_id': i,
                        'status': 'correct'
                    }
                    run.append(run_)
    if len(run) > 0:
        output('run.json', run)

def sync():
    while True:
        print("fetching...")
        try:
            res_list = fetch()
            team_output(res_list)
            run_output(res_list)
            print("fetch successfully")
        except Exception as e:
            print("fetch failed...")
            print(e)
        print("sleeping...")
        time.sleep(20)

sync()



