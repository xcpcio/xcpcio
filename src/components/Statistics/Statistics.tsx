import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { Loading } from '@/components/Loading';
import {
    getProblemChart,
    getTeamChart,
    getSubmitChart,
    timerInterval,
} from './model';
import style from './Statistics.less';

class Statistics extends React.Component {
    timer: any = null;

    clearTimer() {
        this.timer && clearTimeout(this.timer);
    }

    update(props: any) {
        const problemChartOptions = getProblemChart(
            props.contest_config,
            props.team,
            props.run,
        );
        const teamChartOptions = getTeamChart(
            props.contest_config,
            props.team,
            props.run,
        );
        const submitChartOptions = getSubmitChart(
            props.contest_config,
            props.team,
            props.run,
        );
        this.setState({
            problemChartOptions: problemChartOptions,
            teamChartOptions: teamChartOptions,
            submitChartOptions: submitChartOptions,
            loaded: true,
        });
    }

    //在组件已经被渲染到 DOM 中后运行
    async componentDidMount() {
        this.clearTimer();
        this.timer = setTimeout(() => {
            this.update(this.props);
        }, timerInterval);
    }

    //props中的值发生改变时执行
    async componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    //组件卸载前的操作
    componentWillUnmount() {
        this.clearTimer();
    }

    state = {
        loaded: false,
        problemChartOptions: {},
        teamChartOptions: {},
        submitChartOptions: {},
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <>
                {this.state.loaded === false && (
                    <div className={style.loading}>
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <>
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.submitChartOptions}
                        />
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.problemChartOptions}
                        />
                        <HighchartsReact
                            highcharts={Highcharts}
                            options={this.state.teamChartOptions}
                        />
                    </>
                )}
            </>
        );
    }
}

export { Statistics };
