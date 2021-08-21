import React from "react";
import { render } from "react-dom";
import { Router } from "@reach/router";

import Homepage from "./components/homepage";
import ComingSoon from "./components/coming_soon";
import PlanIt from "./components/plan_it";

const rootEl = document.getElementById("app");

render(
  <Router>
    <Homepage path="/"/>
    <ComingSoon path="/dev"/>
    <ComingSoon path="/dash"/>
    <PlanIt path="/planit"/>
    <PlanIt path="/planit/:gameId"/>
    <ComingSoon path="/gravsim"/>
    <ComingSoon path="/emagdrac"/>
    <ComingSoon path="/routiner"/>
  </Router>,
  rootEl,
);
