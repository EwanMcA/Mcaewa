import React, { useEffect, useState } from "react";
import { Layout } from "antd";

import PlanItGame from "./game";
import styles from "./plan_it.scss";

const { Content, Sider } = Layout;

const PlanIt = () => {
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    new PlanItGame();
  }, []);

  return (
    <Layout>
      <Sider collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}/>
      <Content className={styles.gamePane}>
        <canvas id="PlanIt" width="1000" height="1000" className={styles.canvas}/>;
      </Content>
    </Layout>
  );
};

export default PlanIt;

