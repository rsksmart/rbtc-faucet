import React, { useState, useEffect } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { DispenseResponse } from '../types/types.d';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';
import { apiUrl, newCaptchaUrl } from '../utils/env-util';

const RSK_TESTNET_CHAIN = 31;

function App() {
  //Hooks
  const [captcha, setCaptcha] = useState({ id: '', png: '' });
  const [dispenseAddress, setDispenseAddress] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  //Handles
  const handleFaucetButtonClick = async () => {
    setLoading(true);
    axios
      .post(apiUrl() + '/dispense', {
        dispenseAddress,
        captcha: {
          solution: captchaValue,
          id: captcha.id
        }
      })
      .then(res => {
        setLoading(false);
        const data: DispenseResponse = res.data;
        Swal.fire(swalSetup(data));
      })
      .catch(e => {
        //codes 409 or 500
        setLoading(false);
        console.error(e);
        console.error(JSON.stringify(e.response));
        const data: DispenseResponse = e.response.data ? e.response.data : e;
        Swal.fire(swalSetup(data));
      });
      setCaptchaValue('');
  };
  const handleCaptchaValueChange = (event: any) => {
    setCaptchaValue(event.target.value);
  };
  const handleDispenseAddressChange = (event: any) => {
    setDispenseAddress(event.target.value);
  };

  //Methods
  const fetchCaptcha = async () => {
    const result = await axios.post(newCaptchaUrl());
    setCaptcha(result.data);
  };
  const swalSetup = (data: DispenseResponse): SweetAlertOptions => {
    return {
      titleText: data.titleText,
      text: data.text,
      type: data.type,
      onClose: () => {
        if (data.dispenseComplete) {
          fetchCaptcha();
          setDispenseAddress('');
          setCaptchaValue('');
        } else if (data.resetCaptcha) {
          fetchCaptcha();
        }
      }
    };
  };

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
          <Row className="faucet-input">
            <Col className="col-centered">
              <Form.Control
                type="input"
                placeholder="0xcd7872... / alice.rsk"
                value={dispenseAddress}
                onChange={handleDispenseAddressChange}
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col className="col-centered">
              <img className="captcha-image" src={`data:image/png;base64,${captcha.png}`} />
            </Col>
          </Row>
          <br />
          <br />
          <Row className="faucet-input-captcha">
            <Col className="col-centered">
              <Form.Control
                type="input"
                placeholder="Captcha"
                value={captchaValue}
                onChange={handleCaptchaValueChange}
                className="rsk-captcha"
              />
            </Col>
          </Row>
          <br />
          <Row>
            <Col className="col-centered">
              {loading ? (
                <Spinner animation="border" role="status" />
              ) : (
                <Button variant="success" onClick={handleFaucetButtonClick}>
                  Get test RBTC
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </body>
    </div>
  );
}

export default App;
