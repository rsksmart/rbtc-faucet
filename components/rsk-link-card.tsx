import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import FeatureCard from './feature-card';
import Button from 'react-bootstrap/Button';

interface RskLinkCardProps {
  title: string;
  description: string;
  link: string;
  icon: any;
  backgroundColor: string;
}

const RskLinkCard = (props: RskLinkCardProps) => {
  return (
    <Row>
      <FeatureCard padding="p-5" icon={props.icon} title={props.title} backgroundColor={props.backgroundColor}>
        <Container className="p-0 text-left">
          <div style={{ fontSize: 'small', textAlign: 'start', marginBottom: '5%' }}>{props.description} </div>
          <Button
            style={{
              fontSize: 'small',
              textAlign: 'center',
              backgroundColor: props.backgroundColor,
              border: 'transparent',
              borderRadius: '30px'
            }}
            href={props.link}
          >
            <a href={props.link} target="__blank" style={{ color: 'inherit', textDecoration: 'inherit' }}>
              Read More
            </a>
          </Button>
        </Container>
      </FeatureCard>
    </Row>
  );
};

export default RskLinkCard;
