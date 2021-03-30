import React, { useEffect, useState } from "react";
import { Layout } from "antd";
import { useNavigate } from "@reach/router"

import PlanItGame from "./game";
import useLocalStorage from "../../utils/useLocalStorage";
import { newUser } from "./api";
import styles from "./plan_it.scss";
import { useBreakpoint } from "../use_media_qry";

const { Content, Sider } = Layout;

const PlanIt = ({ gameId }) => {
  const device = useBreakpoint();
  const navigate = useNavigate();
  const [game, setGame] = useState({});
  const [userId, setUserId] = useLocalStorage("user_id");
  const [collapsed, setCollapsed] = useState(true);

  useEffect(async () => {
    let uid = userId;
    if (!userId) {
      uid = (await newUser()).user_id;
      setUserId(uid);
    }
    setGame(new PlanItGame(navigate, device, uid, setUserId, gameId));

    return () => game.destruct();
  }, []);

  return (
    <Layout>
      <Sider collapsible collapsed={collapsed} onCollapse={() => setCollapsed(!collapsed)}/>
      <Content className={styles.gamePane}>
        <canvas id="PlanIt" width="1000" height="1000" className={styles.canvas}/>
      </Content>
    </Layout>
  );
};

export default PlanIt;

