import React from "react";
import { Link } from "@reach/router";
import { Card } from "antd";
import "antd/dist/antd.css";
import times from "lodash/times";


import styles from "./card_display.scss";
import placeholder from "./placeholder.jpeg";
import Tesselate from "../tessellate";
import { DEVICES, useBreakpoint } from "../use_media_qry";

const { Meta } = Card;

const CARDS = [
  {
    title: "Dev Page",
    description: "Who built this?",
    cover: (<img alt="personal" src={placeholder}/>),
    link: "dev",
  },
  {
    title: "Dash",
    description: "Configurable Dashboard App",
    cover: (<img alt="dashboard" src={placeholder}/>),
    link: "dash",
  },
  {
    title: "PlanIt",
    description: "Turn based civ builder game",
    cover: (<img alt="planet" src={placeholder}/>),
    link: "planit",
  },
  {
    title: "GravSim",
    description: "Gravity Simulation Game",
    cover: (<img alt="planet" src={placeholder}/>),
    link: "gravsim",
  },
  {
    title: "EmagDrac",
    description: "Build you own card game",
    cover: (<img alt="cards" src={placeholder}/>),
    link: "emagdrac",
  }
];

const CardDisplay = () => {
  const refs = times(CARDS.length, React.createRef);
  const device = useBreakpoint();

  return (
    <>
      <Tesselate density={device < DEVICES.DESKTOP ? 100 : 250} rippleRefs={refs}/>
      <div className={styles.cardDisplay}>
        { CARDS.map((card, idx) => (
          <Link to={card.link} key={idx} ref={refs[idx]} className={styles.cardWrapper}>
            <Card
              hoverable
              cover={card.cover}
              style={{ backgroundColor: "#CCF" }}
            >
              <Meta title={card.title} description={card.description} />
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
};

export default CardDisplay;
