import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios';
import '../assets/styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ButtonProps, Row, Container, Col, Modal } from 'react-bootstrap';
import config from '../config.json';
import rskjsUtil from 'rskjs-util';

const RSK_TESTNET_CHAIN = 31;


function App() {
  //Components
  interface FaucetButton {
    variant: ButtonProps['variant'];
    onClick:
      | ((event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void)
      | undefined;
  }
  const FaucetButton = (props: FaucetButton) => {
    return (
      <Button variant={props.variant} onClick={props.onClick}>
        Get test RBTC
      </Button>
    );
  };

  //Hooks
  const [faucetVariant, setFaucetVariant] = useState<any>('success');
  const [captcha, setCaptcha] = useState({ id: '', png: '' });
  const [dispenseAddress, setDispenseAddress] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCaptcha = async () => {
      const result = await axios.post(config.NEW_CAPTCHA_URL);
      setCaptcha(result.data);
    };
    fetchCaptcha();
  }, []);

  //Methods
  const handleFaucetButtonClick = async () => {
    try {
      setShowModal(true);
    } catch (e) {
      setFaucetVariant('danger');
    }
  };
  const handleCaptchaValueChange = (event: any) => {
    setCaptchaValue(event.target.value);
  };
  const handleDispenseAddressChange = (event: any) => {
    setDispenseAddress(event.target.value);
  };
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  return (
    <div className="background">
      <Navbar className="navbar-rsk">
        <Navbar.Brand>
          <img className="logo" />
        </Navbar.Brand>
      </Navbar>
      <body className="app-body">
        <Container className="faucet-container">
          <Row>
            <Col className="col-centerer">
              <Form.Label>Enter your testnet address or RNS name</Form.Label>
            </Col>
          </Row>
          <Row>
            <Col className="col-centered">
              <Form.Control
                type="input"
                placeholder="Address"
                value={dispenseAddress}
                onChange={handleDispenseAddressChange}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col className="col-centered">
              <img
                className="captcha-image"
                src={`data:image/png;base64,${captcha.png}`}
              />
            </Col>
          </Row>
          <br />
          <br />
          <Row>
            <Col className="col-centered">
              <Form.Control
                className="faucet-input"
                type="input"
                placeholder="Captcha"
                value={captchaValue}
                onChange={handleCaptchaValueChange}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col className="col-centered">
              <FaucetButton
                variant={faucetVariant}
                onClick={handleFaucetButtonClick}
              />
            </Col>
          </Row>
          <Modal centered show={showModal} onHide={handleClose} >
            <Modal.Header className="background-modal" closeButton>
              <Modal.Title>Successfully sent some RBTCs to {dispenseAddress}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="background-modal">
              {
                !rskjsUtil.isChecksumed(dispenseAddress, RSK_TESTNET_CHAIN)? <>Please consider using this address with RSK Testnet checksum: {rskjsUtil.toChecksumAddress(dispenseAddress, null, RSK_TESTNET_CHAIN)}</> : <></>
              }
            </Modal.Body>
            <Modal.Footer className="background-modal">
              <Button variant="secondary" onClick={handleClose}>
                Close
              </Button>
              <Button variant="success" onClick={handleClose}>
                Save Changes
              </Button>
            </Modal.Footer >
          </Modal>
        </Container>
      </body>
    </div>
  );
}

export default App;
