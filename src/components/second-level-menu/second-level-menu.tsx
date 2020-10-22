import React from 'react';
import './second-level.menu.css';

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

    //props中的值发生改变时执行
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

    render() {
        return (
            <div className="second-level-menu-list">
                {this.state.siderItem.map((item: any) => {
                    return (
                        <div
                            className={[
                                'second-level-menu-item',
                                item == this.state.currentItem
                                    ? 'second-level-menu-item-current'
                                    : '',
                            ].join(' ')}
                            onClick={() => {
                                const pathname = window.location.pathname;
                                let query: any = {};
                                for (const [key, value] of this.state.params) {
                                    query[key] = value;
                                }
                                query[this.state.queryName] = item;
                                this.state.history.push({
                                    pathname: pathname,
                                    query: query,
                                });
                            }}
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
