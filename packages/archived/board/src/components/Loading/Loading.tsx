import React from "react";
import style from "./Loading.module.less";

const Loading: React.FC<{}> = () => {
  return (
    <div className={[style["loader21"], style["loader"]].join(" ")}>
      <div className={style["loader-21"]}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export { Loading };
