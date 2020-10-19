import React from 'react';
import './Loading.less';

class Loading extends React.Component {
  //在组件已经被渲染到 DOM 中后运行
  async componentDidMount() {}

  //props中的值发生改变时执行
  async componentWillReceiveProps(nextProps: any) {}

  state = {};

  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className="loader21 loader">
        <div className="loader-21">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
}

export default Loading;
