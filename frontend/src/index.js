import React from "react";
import { render } from "react-dom";
import { Router } from "@reach/router";

import App from "./components/app";
import ComingSoon from "./components/coming_soon";

const rootEl = document.getElementById("app");

render(
  <Router>
    <App path="/"/>
    <ComingSoon path="/dev"/>
    <ComingSoon path="/dash"/>
    <ComingSoon path="/planit"/>
    <ComingSoon path="/gravsim"/>
    <ComingSoon path="/emagdrac"/>
  </Router>,
  rootEl,
);
