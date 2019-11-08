import React from 'react';
//import '../assets/styles/sb-admin-2/sb-admin-2.scss';
import { Row, Container, Col, Card } from 'react-bootstrap';


interface FaucetCardProps {
  title: string;
  children: any;
  backgroundColor: string;
  icon: any;
}

const FeatureCard = (props: FaucetCardProps) => {
  return (
    <Card className="p-0 m-0 card shadow " style={{ backgroundColor: props.backgroundColor, border: 'transparent' }}>
      <Card.Body className="m-0 p-0 ">
        <Row noGutters>
          <Col sm={4}>
            <Container className="w-100 h-100" style={{paddingTop: '100%'}}>
              {props.icon}
            </Container>
          </Col>
          <Col sm={8} style={{ backgroundColor: 'white' }}>
            <Container className="p-5">
              <Row className="font-weight-bold text-gray-800 p-1">{props.title}</Row>
              <Row className="text-xs pt-0 pb-3 pr-3 pl-3">{props.children}</Row>
            </Container>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default FeatureCard;

/*
const FeatureCard = (props: FaucetCardProps) => {
  return (
    <Card className="card shadow h-100 " style={{ width: '100% !important', padding: '0px !important' }}>
      <Container className="no-padding" style={{backgroundColor: props.backgroundColor, borderRadius: '1%'}}>
        <Container className="font-weight-bold text-gray-800" style={{ padding: '0%' }}>
          <Row>
            <Col className="no-padding full-width" xs={4} ></Col>
            <Col xs={8} className="white-background" style={{backgroundColor: 'white !important'}}>
              <Row
                className="text-xs font-weight-bold text-primary text-uppercase"
                style={{ textAlign: 'start', marginBottom: '5%' }}
              >
                {props.title}
              </Row>
              {props.children}
            </Col>
          </Row>
        </Container>
      </Container>
    </Card>
  );
};
*/
