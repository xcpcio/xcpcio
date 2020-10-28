import React from 'react';
import style from './Loading.less';

class Loading extends React.Component {
    constructor(props: any) {
        super(props);
    }

    render() {
        return (
            <div className={[style['loader21'], style['loader']].join(' ')}>
                <div className={style['loader-21']}>
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
