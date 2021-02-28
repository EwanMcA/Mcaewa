import React from "react";
import { render } from "react-dom";
import App from "./components/app";
import { Router } from "@reach/router";

const rootEl = document.getElementById("app");

const Placeholder = ({path}) => <h1 >{ path }</h1>;

render(
  <Router>
    <App path="/"/>
    <Placeholder path="/dev"/>
    <Placeholder path="/dash"/>
    <Placeholder path="/planit"/>
    <Placeholder path="/gravsim"/>
    <Placeholder path="/emagdrac"/>
  </Router>,
  rootEl,
);
