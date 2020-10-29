import React from 'react';
import style from './SecondLevelMenu.less';

class SecondLevelMenu extends React.Component {
    update(props: any) {
        this.setState({
            params: props.params,
            history: props.history,
            queryName: props.queryName || '',
            siderItem: props.siderItem || [],
            currentItem: props.currentItem || '',
        });
    }

    componentDidMount() {
        this.update(this.props);
    }

    async componentWillReceiveProps(nextProps: any) {
        this.update(nextProps);
    }

    constructor(props: any) {
        super(props);
    }

    state = {
        params: {},
        history: {},
        queryName: '',
        siderItem: [],
        currentItem: '',
    };

    changeTab = (tab: string, _this: any) => {
        const pathname = window.location.pathname;
        console.log(_this.state.params);
        console.log({
            ..._this.state.params,
            ...{ [_this.state.queryName]: tab },
        });
        let query: any = {};
        for (const [k, v] of _this.state.params) {
            query[k] = v;
        }
        query[_this.state.queryName] = tab;
        _this.state.history.push({
            pathname: pathname,
            query: query,
        });
    };

    render() {
        return (
            <div className={style['second-level-menu-list']}>
                {this.state.siderItem.map((item: any) => {
                    return (
                        <div
                            className={[
                                style['second-level-menu-item'],
                                item == this.state.currentItem
                                    ? style['second-level-menu-item-current']
                                    : '',
                            ].join(' ')}
                            onClick={() => this.changeTab(item, this)}
                        >
                            {item}
                        </div>
                    );
                })}
            </div>
        );
    }
}

export default SecondLevelMenu;
