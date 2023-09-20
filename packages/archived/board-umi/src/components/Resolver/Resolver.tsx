import { Button } from "antd";

import style from "../Export/Export.module.less";

const Resolver = () => {
  return (
    <>
      <br />
      <br />

      <Button
        className={style.btn}
        type="primary"
        size="middle"
        onClick={() => {
          window.location.href = `https://resolver.xcpcio.com/resolver?xcpcio-data-source=${window.location.pathname}`;
        }}
      >
        Go To Resolver
      </Button>
    </>
  );
};

export default Resolver;
export { Resolver };
