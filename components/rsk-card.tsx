import React from 'react';
import { Row, Container, Col, Card } from 'react-bootstrap';
import '../assets/styles/rsk-link-card.css';
import '../assets/styles/rsk-card.css';

interface RskCardProps {
  title: string;
  children: any;
  backgroundColor: string;
  icon: any;
  className?: string;
  padding: 'p-1' | 'p-2' | 'p-3' | 'p-4' | 'p-5';
}

const RskCard = (props: RskCardProps) => {
  return (
    <Card className="p-0 m-0 card rsk-shadow rsk-card rounded-rsk">
      <Card.Body className="p-0">
        <Container className="m-0 p-0 w-100 h-100">
          <Row className="w-100 m-0 p-0 rsk-row">
            <Col sm={4} className="p-0">
              <Container
                className="w-100 h-100 p-0 vertical-center rounded-rsk-left"
                style={{ backgroundColor: props.backgroundColor }}
              >
                {props.icon}
              </Container>
            </Col>
            <Col sm={8} className="p-0 white-background-right-rounded">
              <Container className={props.padding}>
                <div className="font-weight-bold text-left">{props.title}</div>
                {props.children}
              </Container>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
};

export default RskCard;
