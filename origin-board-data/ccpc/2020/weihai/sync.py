import requests
import json
from os import path
import time

def json_input(path):
    with open(path, 'r') as f:
        return json.load(f)

_params = json_input('params.json')
data_dir = _params['data_dir']
penalty = 20

def json_output(data):
    return json.dumps(data, sort_keys=False, indent=4, separators=(',', ':'), ensure_ascii=False)

def output(filename, data):
    with open(path.join(data_dir, filename), 'w') as f:
        f.write(json_output(data))

def get_timestamp(dt):
    #转换成时间数组
    timeArray = time.strptime(dt, "%Y-%m-%d %H:%M:%S")
    #转换成时间戳
    timestamp = time.mktime(timeArray)
    return int(timestamp)

def get_now():
    return int(round(time.time() * 1000))

def fetch():
    if 'board_url' in _params.keys():
        board_url = _params['board_url']
        params = (
            ('t', get_now()),
        )   
        response = requests.get(board_url, params=params)
        return json.loads(response.text)
    else:
        board_file = _params['board_file']
        return json_input(board_file)

def team_output(res):
    team = {}
    for item in res['rows']:
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
    if len(team.keys()) > 0:
        output("team.json", team)
                    
def run_output(res):
    run = []
    for item in res['rows']:

        team_id = item['user']['id']
        total_time = item['score']['time'][0]
        penalty_num = 0
        for problem in item['statuses']:
            if problem['result'] == 'AC':
                total_time -= int(problem['time'][0])

        penalty_num = total_time // penalty

        problem_id = -1
        for problem in item['statuses']:
            problem_id += 1

            status = 'incorrect'
            if problem['result'] == 'AC' or problem['result'] == 'FB':
                status = 'correct'
            
            timestamp = int(problem['time'][0]) * 60
            
            tries = int(problem['tries'])
            
            if status == 'correct':
                tries -= 1
                if tries < penalty_num:
                    penalty_num -= tries
                else:
                    tries = penalty_num
                    penalty_num = 0
                _run = {}
                _run['team_id'] = team_id
                _run['timestamp'] = timestamp
                _run['status'] = 'correct'
                _run['problem_id'] = problem_id
                run.append(_run)

            if tries > 0: 
                for j in range(0, tries):
                    _run = {}
                    _run['team_id'] = team_id
                    _run['timestamp'] = timestamp
                    _run['status'] = 'incorrect'
                    _run['problem_id'] = problem_id
                    run.append(_run)
    if len(run) > 0:
        output('run.json', run)

def sync():
    while True:
        print("fetching...")
        try:
            res = fetch()
            team_output(res)
            run_output(res)
            print("fetch successfully")
        except Exception as e:
            print("fetch failed...")
            print(e)
        print("sleeping...")
        time.sleep(20)

sync()