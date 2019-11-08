import React from 'react';
import Container from 'react-bootstrap/Container';
import RskCard from './rsk-card';
import Button from 'react-bootstrap/Button';
import '../assets/styles/rsk-link-card.css';

interface RskLinkCardProps {
  title: string;
  description: string;
  link: string;
  icon: any;
  backgroundColor: string;
}

const RskLinkCard = (props: RskLinkCardProps) => {
  return (
    <RskCard padding="p-5" icon={props.icon} title={props.title} backgroundColor={props.backgroundColor}>
      <Container className="p-0 text-left">
        <div className="rsk-link-card-description">{props.description} </div>
        <Button
          className="button-rsk rounded-rsk"
          style={{
            backgroundColor: props.backgroundColor
          }}
          href={props.link}
        >
          <a href={props.link} target="__blank" className="inherit-style">
            Read More
          </a>
        </Button>
      </Container>
    </RskCard>
  );
};

export default RskLinkCard;
