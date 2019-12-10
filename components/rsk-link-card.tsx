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
    <RskCard padding="p-3" icon={props.icon} title={props.title} backgroundColor={props.backgroundColor}>
      <Container className="p-0 text-left">
        <div className="rsk-link-card-description">{props.description} </div>
        <Button
          className="button-rsk rounded-rsk"
          style={{
            backgroundColor: props.backgroundColor
          }}
          onClick={() => window.open(props.link, '__blank')}
        >
          Read More
        </Button>
      </Container>
    </RskCard>
  );
};

export default RskLinkCard;
