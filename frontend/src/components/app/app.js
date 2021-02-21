import React from "react";
import "antd/dist/antd.css";

import styles from "./app.scss";
import CardDisplay from "../card_display";

const App = () => (
  <div className={styles.homepage}>
    <CardDisplay/>
  </div>
);

export default App;
