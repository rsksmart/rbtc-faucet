import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import FeatureCard from './feature-card';

interface FaucetProps {
  captcha: any;
  loading: boolean;
  dispenseAddress: string;
  captchaValue: string;
  onAddressChange: (event: any) => void;
  onCaptchaValueChange: (event: any) => void;
  onDispenseClick: () => void;
}

const Faucet = (props: FaucetProps) => {
  return (
    <FeatureCard
      padding="p-5"
      icon={<img className="faucet-icon" />}
      title="Faucet"
      backgroundColor="#2c9dc3"
      className="p-0 m-0"
    >
      <Container className="p-0">
        <div>
          <div style={{ fontSize: 'small', textAlign: 'start', marginBottom: '5%' }}>Address or RNS name</div>
          <Form.Control
            type="input"
            placeholder="0xcd7872... / alice.rsk"
            value={props.dispenseAddress}
            onChange={props.onAddressChange}
            style={{ marginBottom: '5%', fontSize: 'small', textAlign: 'start' }}
          />
        </div>
        <div>
          <Form.Control
            type="input"
            placeholder="Captcha"
            value={props.captchaValue}
            onChange={props.onCaptchaValueChange}
            className="rsk-captcha"
            style={{ marginBottom: '5%', fontSize: 'small', textAlign: 'start' }}
          />
        </div>
        <div>
          <img
            className="captcha-image"
            src={`data:image/png;base64,${props.captcha.png}`}
            style={{ marginBottom: '5%', width: '100%' }}
          />
        </div>
        <div>
          {props.loading ? (
            <Spinner animation="border" role="status" />
          ) : (
            <Button
              variant="primary"
              onClick={props.onDispenseClick}
              style={{
                width: '100%',
                fontSize: 'small',
                borderRadius: '30px',
                borderColor: '#2c9dc3',
                backgroundColor: '#2c9dc3'
              }}
            >
              Get test RBTC
            </Button>
          )}
        </div>
      </Container>
    </FeatureCard>
  );
};

export default Faucet;
