import requests
import json
import grequests
from os import path

COKIE


params = (
    ('page', '0'),
    ('limit', '50'),
)

response = requests.get('https://pintia.cn/api/problem-sets/1319876646838063104/rankings', headers=headers, params=params, cookies=cookies)

# #NB. Original query string below. It seems impossible to parse and
# #reproduce query strings 100% accurately so the one below is given
# #in case the reproduced version is not "correct".
# # response = requests.get('https://pintia.cn/api/problem-sets/1319876646838063104/rankings?page=0&limit=50', headers=headers, cookies=cookies)

total = json.loads(response.text)['total']
print(total)

req_list = []

for i in range(((total + 49) // 50)):
    params = (
        ('page', str(i)),
        ('limit', '50'),
    )
    req_list.append(grequests.get('https://pintia.cn/api/problem-sets/1319876646838063104/rankings', headers=headers, params=params, cookies=cookies))

res_list = grequests.map(req_list)

run = []

data_dir = "../../../../data/ccpc/2020/weihai-warmup"

def json_output(data):
    return json.dumps(data, sort_keys=False, indent=4, separators=(',', ':'), ensure_ascii=False)

def output(filename, data):
    with open(path.join(data_dir, filename), 'w') as f:
        f.write(json_output(data))

for item in res_list:
    item = json.loads(item.text)
    problem_id = item['commonRankings']['labels']
    for team in item['commonRankings']['commonRankings']:
        if 'studentUser' in team['user'].keys():
            team_id = team['user']['studentUser']['studentNumber']
            for key in team['problemScores']:
                p_id = problem_id.index(key)
                _run = team['problemScores'][key]
                timestamp = int(_run['acceptTime']) * 60
                cnt = int(_run['submitCountSnapshot'])
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

    


