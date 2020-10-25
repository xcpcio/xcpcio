import requests
import json
import grequests
from os import path

def json_input(path):
    with open(path, 'r') as f:
        return json.load(f)

_params = json_input('params.json')

# print(_params)

cookies = _params['cookies']

## print(cookies)

headers = _params['headers']

# print(headers)

params = (
    ('page', '0'),
    ('limit', '50'),
)

response = requests.get('https://pintia.cn/api/problem-sets/1320042663639977984/rankings', headers=headers, params=params, cookies=cookies)

#NB. Original query string below. It seems impossible to parse and
#reproduce query strings 100% accurately so the one below is given
#in case the reproduced version is not "correct".
# response = requests.get('https://pintia.cn/api/problem-sets/1320042663639977984/rankings?limit=50', headers=headers, cookies=cookies)

total = json.loads(response.text)['total']
print(total)

req_list = []

for i in range(((total + 49) // 50)):
    params = (
        ('page', str(i)),
        ('limit', '50'),
    )
    req_list.append(grequests.get('https://pintia.cn/api/problem-sets/1320042663639977984/rankings', headers=headers, params=params, cookies=cookies))

res_list = grequests.map(req_list)

run = []

data_dir = "../../../../data/ccpc/2020/weihai"

def getOldData():
    _run = json_input(path.join(data_dir, "run.json"))
    team = {}
    for item in _run:
        if not item['team_id'] in team.keys():
            team[item['team_id']] = {}
        _team = team[item['team_id']]
        if not item['problem_id'] in _team.keys():
            _team[item['problem_id']] = {}
            _team[item['problem_id']]['solved'] = 0
            _team[item['problem_id']]['attempted_num'] = 0
        if item['status'] == 'correct':
            _team[item['problem_id']]['solved'] = 1
        _team[item['problem_id']]['attempted_num'] += 1
    return team

def json_output(data):
    return json.dumps(data, sort_keys=False, indent=4, separators=(',', ':'), ensure_ascii=False)

def output(filename, data):
    with open(path.join(data_dir, filename), 'w') as f:
        f.write(json_output(data))

# def team_output():
#     for item in res_list:
        

def run_output():
    oldData = getOldData()
    # print(oldData)
    for item in res_list:
        item = json.loads(item.text)
        # print(item)
        problem_id = item['commonRankings']['labels']
        for team in item['commonRankings']['commonRankings']:
            if 'studentUser' in team['user'].keys():
                team_id = team['user']['studentUser']['studentNumber']
                for key in team['problemScores']:
                    p_id = problem_id.index(key)
                    _run = team['problemScores'][key]
                    timestamp = int(_run['acceptTime']) * 60
                    cnt = int(_run['submitCountSnapshot'])
                    # if team_id in oldData.keys():
                    #     if p_id in oldData[team_id].keys():
                    #         if oldData[team_id]['status'] == 'correct':
                    #             cnt = min(cnt, oldData[team_id]['attempted_num'])
                    for i in range(1, cnt):
                        run_ = {
                            'team_id': team_id,
                            'timestamp': timestamp,
                            'problem_id': p_id,
                            'status': 'incorrect'
                        }
                        run.append(run_)
                    run_ = {
                        'team_id': team_id,
                        'timestamp': timestamp,
                        'problem_id': p_id,
                        'status': 'incorrect'
                    } 
                    if int(_run['score']) == 300:
                        run_['status'] = 'correct'
                    run.append(run_)
        output('run.json', run)

# team_output()
run_output()


