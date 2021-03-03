import React from "react";
import PropTypes from "prop-types";
import { Link } from "@reach/router";

import styles from "./coming_soon.scss";

const ComingSoon = ({path}) => (
  <div className={styles.msg} >
    <h1>{ path.slice(1) } is in development</h1>
    <Link to="/" className={styles.link}>Mcaewa Home</Link>
  </div>
);

ComingSoon.propTypes = {
  path: PropTypes.string.isRequired,
};

export default ComingSoon;
