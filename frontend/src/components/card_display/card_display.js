import React from "react";
import { Link } from "@reach/router";
import { Card } from "antd";
import "antd/dist/antd.css";
import times from "lodash/times";


import styles from "./card_display.scss";
import dash from "./dash.png";
import diamond from "./coolDiamond.png";
import gravSim from "./gravSim.png";
import me from "./me.jpg";
import placeholder from "./placeholder.jpeg";
import Tesselate from "../tessellate";
import { DEVICES, useBreakpoint } from "../use_media_qry";

const { Meta } = Card;

const CARDS = [
  {
    title: "Dev Page",
    description: "Who built this?",
    cover: (<img alt="avatar" className={styles.coverPic} src={me}/>),
    link: "dev",
  },
  {
    title: "PlanIt",
    description: "Turn based civ builder game",
    cover: (<img alt="planet" className={styles.coverPic} src={placeholder}/>),
    link: "planit",
  },
  {
    title: "EmagDrac",
    description: "Build you own card game",
    cover: (<img alt="cards" className={styles.coverPic} src={diamond}/>),
    link: "emagdrac",
  },
  {
    title: "GravSim",
    description: "Gravity Simulation Game",
    cover: (<img alt="gravity" className={styles.coverPic} src={gravSim}/>),
    link: "gravsim",
  },
  {
    title: "Dash",
    description: "Configurable Dashboard App",
    cover: (<img alt="dashboard" className={styles.coverPic} src={dash}/>),
    link: "dash",
  },
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
