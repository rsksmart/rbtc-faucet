import React from 'react';
//import '../assets/styles/sb-admin-2/sb-admin-2.scss';
import { Row, Container, Col, Card } from 'react-bootstrap';

interface FaucetCardProps {
  title: string;
  children: any;
  backgroundColor: string;
  icon: any;
  className?: string;
  padding: 'p-1' | 'p-2' | 'p-3' | 'p-4' | 'p-5';
}

const FeatureCard = (props: FaucetCardProps) => {
  return (
    <Card
      className="p-0 m-0 card rsk-shadow"
      style={{ backgroundColor: props.backgroundColor, border: 'white', borderRadius: '30px'}}
    >
      <Card.Body className="p-0">
        <Container className="m-0 p-0 w-100 h-100">
          <Row className="w-100 m-0 p-0">
            <Col sm={4}>
              <Container className="w-100 h-100 p-0 vertical-center">{props.icon}</Container>
            </Col>
            <Col sm={8} className="p-0" style={{ backgroundColor: 'white',  borderTopRightRadius: '30px', borderBottomRightRadius: '30px'  }}>
              <Container fluid className={props.padding}>
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
