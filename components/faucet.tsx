import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import RskCard from './rsk-card';
import '../assets/styles/faucet.css';

export interface FaucetProps {
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
    <RskCard
      padding="p-4"
      icon={<img className="faucet-icon" />}
      title="Faucet"
      backgroundColor="#2c9dc3"
      className="p-0 m-0"
    >
      <Container className="p-0">
        <div>
          <div className="faucet-label">Address or RNS name</div>
          <Form.Control
            className="faucet-control rounded-rsk"
            type="input"
            placeholder="0xcd7872... / alice.rsk"
            value={props.dispenseAddress}
            onChange={props.onAddressChange}
          />
        </div>
        <div>
          <Form.Control
            type="input"
            placeholder="Captcha"
            value={props.captchaValue}
            onChange={props.onCaptchaValueChange}
            className="faucet-control rounded-rsk"
          />
        </div>
        <div>
          {props.captcha.id != '-1' ? (
            <img className="faucet-captcha-image rounded-rsk" src={`data:image/png;base64,${props.captcha.png}`} />
          ) : (
            <Spinner className="faucet-captcha-spinner" animation="border" role="status" />
          )}
        </div>
        <div>
          {props.loading ? (
            <Spinner animation="border" role="status" />
          ) : (
            <Button onClick={props.onDispenseClick} className="faucet-button button-rsk  rounded-rsk">
              Get test RBTC
            </Button>
          )}
        </div>
      </Container>
    </RskCard>
  );
};

export default Faucet;
