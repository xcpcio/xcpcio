export const height = 400;
export const timerInterval = 200;

function getSolvedAndTime(problem: any) {
    let solved = 0,
        time = 0;
    problem.forEach((problem: any) => {
        if (problem.solved === 1) {
            solved += 1;
            time += problem.time;
        }
    });
    return { solved: solved, time: time };
}

function comp(a: any, b: any) {
    if (a.solved > b.solved) return 1;
    if (a.solved == b.solved && a.time < b.time) return 1;
    return 0;
}

function getTeamPlace(contest_config: any, cur_team: any, team: any, run: any) {
    let data = [];
    run.sort((a: any, b: any) => {
        if (a.timestamp < b.timestamp) return -1;
        if (a.timestamp > b.timestamp) return 1;
        return 0;
    });
    const duration = Math.floor(
        (contest_config.end_time - contest_config.start_time) / 60,
    );
    let teams: any = {};
    for (let k in team) {
        teams[k] = {};
        teams[k]['problem'] = [];
        contest_config.problem_id.forEach((problem_id: any) => {
            let problem: any = {};
            problem['problem_id'] = problem_id;
            problem['solved'] = 0;
            problem['time'] = 0;
            teams[k].problem.push(problem);
        });
    }
    const run_len = run.length;
    let pos = 0;
    for (let i = 0; i <= duration; ++i) {
        while (pos < run_len && run[pos].timestamp <= i * 60) {
            let run_item = run[pos];
            let team_id = run_item.team_id;
            let status = run_item.status;
            let problem_id = run_item.problem_id;
            let time = run_item.timestamp;
            if (status === 'correct') {
                teams[team_id].problem[problem_id].solved = 1;
                teams[team_id].problem[problem_id].time += Math.floor(
                    time / 60,
                );
            } else {
                teams[team_id].problem[problem_id].time += Math.floor(
                    contest_config.penalty / 60,
                );
            }
            ++pos;
        }
        let cur_team_data = getSolvedAndTime(teams[cur_team.team_id].problem);
        let place = 1;
        for (let k in teams) {
            if (k !== cur_team.team_id) {
                let team = teams[k];
                let team_data = getSolvedAndTime(team.problem);
                place += comp(team_data, cur_team_data);
            }
        }
        data.push({ x: i, y: place });
    }
    return data;
}

export function getHichartsOptions(
    contest_config: any,
    cur_team: any,
    team: any,
    run: any,
) {
    const options: Highcharts.Options = {
        title: {
            text: '排名变化趋势',
        },
        series: [
            {
                name: '排名',
                type: 'line',
                data: getTeamPlace(contest_config, cur_team, team, run),
            },
        ],
        xAxis: [
            {
                allowDecimals: false,
                title: {
                    text: '时间',
                },
            },
        ],
        yAxis: [
            {
                allowDecimals: false,
                reversed: true,
                title: {
                    text: '排名',
                },
            },
        ],
        credits: {
            enabled: false,
        },
    };
    return options;
}
