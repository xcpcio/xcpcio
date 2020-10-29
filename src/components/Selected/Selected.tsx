import React from 'react';
import { Select } from 'antd';
const { Option } = Select;

class Selected extends React.Component {
    update(props: any) {
        this.setState({
            placeholder: props.placeholder || '',
            params: props.params,
            history: props.history,
            queryName: props.queryName || '',
            selectedItem: props.selectedItem || [],
            currentSelected: props.currentSelected || [],
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
        placeholder: '',
        params: {},
        history: {},
        queryName: '',
        selectedItem: [],
        currentSelected: [],
    };

    onChange(values: any) {
        const pathname = window.location.pathname;
        let query: any = {};
        for (const [key, value] of this.state.params) {
            query[key] = value;
        }
        query[this.state.queryName] = JSON.stringify(values);
        this.state.history.push({
            pathname: pathname,
            query: query,
        });
    }

    render() {
        return (
            <>
                <Select
                    mode="multiple"
                    allowClear
                    style={{ width: '100%' }}
                    placeholder={this.state.placeholder}
                    key={this.state.currentSelected}
                    defaultValue={this.state.currentSelected}
                    onChange={this.onChange.bind(this)}
                >
                    {this.state.selectedItem.map((item: any, index: number) => {
                        return <Option key={item}>{item}</Option>;
                    })}
                </Select>
            </>
        );
    }
}

export { Selected };
