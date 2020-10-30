import { Loading } from '@/components/Loading';
import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import style from './Placecharts.less';
import { height, timerInterval, getHichartsOptions } from './model';

class Placecharts extends React.Component {
    timer: any = null;

    clearTimer() {
        this.timer && clearTimeout(this.timer);
    }

    async update(props: any) {
        const options = getHichartsOptions(
            props.contest_config,
            props.cur_team,
            props.team,
            props.run,
        );
        this.setState({
            loaded: true,
            options: options,
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
        this.clearTimer();
        this.setState({ loaded: false });
        this.timer = setTimeout(() => {
            this.update(nextProps);
        });
    }

    //组件卸载前的操作
    componentWillUnmount() {
        this.clearTimer();
    }

    state = {
        loaded: false,
        options: {},
    };

    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <>
                {this.state.loaded === false && (
                    <div
                        className={style.loading}
                        style={{
                            height: height,
                        }}
                    >
                        <Loading />
                    </div>
                )}

                {this.state.loaded === true && (
                    <HighchartsReact
                        style={{
                            height: { height },
                        }}
                        highcharts={Highcharts}
                        options={this.state.options}
                    />
                )}
            </>
        );
    }
}

export { Placecharts };
