import React from "react";
import "antd/dist/antd.css";

import styles from "./homepage.scss";
import CardDisplay from "../card_display";

const Homepage = () => (
  <div className={styles.homepage}>
    <CardDisplay/>
  </div>
);

export default Homepage;
