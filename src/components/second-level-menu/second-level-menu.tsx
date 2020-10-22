import React from 'react';
import './second-level.menu.css';

class SecondLevelMenu extends React.Component {
    componentDidMount() {
        this.setState({
            siderItem: this.props.siderItem || [],
            currentItem: this.props.currentItem || '',
        });
    }

    constructor(props: any) {
        super(props);
    }

    state = {
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
