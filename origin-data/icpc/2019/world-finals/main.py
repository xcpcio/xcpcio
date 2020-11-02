from os import path
import os
import json
import time

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

data_dir = "../../../../data/icpc/2019/world-finals"
problem_num = 11
problem_id = [chr(ord('A') + i) for i in range(problem_num)] 
status_time_display = {
    'correct': 1,
}
medal = {
    "all": {
        "gold": 4,
        "silver": 4,
        "bronze": 4,
    }
}
balloon_color = [
    {'background_color': '#040000', 'color': '#fff' },
    {'background_color': '#E5B9BC', 'color': '#000' },
    {'background_color': '#92DAEF', 'color': '#000' },
    {'background_color': '#E92F24', 'color': '#fff' },
    {'background_color': '#B45700', 'color': '#fff' },
    {'background_color': '#8A48BD', 'color': '#fff' },
    {'background_color': '#fae61b', 'color': '#000' },
    {'background_color': '#ED4086', 'color': '#fff' },
    {'background_color': '#15BF8F', 'color': '#fff' },
    {'background_color': '#FD7C16' ,'color': '#fff' },
    {'background_color': '#009AE2', 'color': '#fff' },
]
config = {
    'contest_name': 'ICPC2019-43rd World Finals',
    'start_time': get_timestamp("2019-4-4 09:00:00"),
    'end_time': get_timestamp("2019-4-4 14:00:00"),
    'frozen_time' : 60 * 60,
    'problem_id': problem_id,
    # 'group': group,
    # 'organization': 'School',
    'medal': medal,
    'status_time_display': status_time_display,
    'penalty': 20 * 60,
    'banner': 'images/logos.2019/banner.png',
    'balloon_color': balloon_color,
    'badge': 'Badge',
}

def config_out():
    output("config.json", config)

mkdir(data_dir)
config_out()
