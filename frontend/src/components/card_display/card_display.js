import React from "react";
import { Card } from "antd";
import "antd/dist/antd.css";

import styles from "./card_display.scss";
import placeholder from "./placeholder.jpeg";

const { Meta } = Card;

const CARDS = [
  {
    title: "Dev Page",
    description: "Who built this?",
    cover: (<img alt="personal" src={placeholder}/>),
  },
  {
    title: "Dash",
    description: "Configurable Dashboard App",
    cover: (<img alt="dashboard" src={placeholder}/>),
  },
  {
    title: "PlanIt",
    description: "Turn based civ builder game",
    cover: (<img alt="planet" src={placeholder}/>),
  },
  {
    title: "EmagDrac",
    description: "Build you own card game",
    cover: (<img alt="cards" src={placeholder}/>),
  }
];

const CardDisplay = () => (
  <div className={styles.cardDisplay}>
    { CARDS.map((card, idx) => (
      <div key={idx} className={styles.siteCard}>
        <Card
          hoverable
          cover={card.cover}
        >
          <Meta title={card.title} description={card.description} />
        </Card>
      </div>
    ))}
  </div>
);

export default CardDisplay;
