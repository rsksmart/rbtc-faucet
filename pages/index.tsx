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
import FeatureCard from '../components/feature-card';

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
        <Navbar.Brand className="navbar-brand-rsk">
          <img className="logo" />
        </Navbar.Brand>
      </Navbar>
      <body className="app-body">
        <Container style={{ margin: 0, padding: 0, width: '100%', maxWidth: '80%' }}>
          <Row style={{ width: '100%' }}>
            <Col>
              <Container className="h-100 w-100">
                
              </Container>
            </Col>
            <Col>
              <FeatureCard icon={<img className="faucet-icon"/>} title="Faucet" backgroundColor="#007bff">
                <Container className="p-0">
                  <Row>
                    <div style={{ fontSize: 'small', textAlign: 'start', marginBottom: '5%' }}>
                      Address or RNS name
                    </div>
                    <Form.Control
                      type="input"
                      placeholder="0xcd7872... / alice.rsk"
                      value={dispenseAddress}
                      onChange={handleDispenseAddressChange}
                      style={{ marginBottom: '5%', fontSize: 'small', textAlign: 'start' }}
                    />
                  </Row>
                  <Row>
                    <Form.Control
                      type="input"
                      placeholder="Captcha"
                      value={captchaValue}
                      onChange={handleCaptchaValueChange}
                      className="rsk-captcha"
                      style={{ marginBottom: '5%', fontSize: 'small', textAlign: 'start' }}
                    />
                  </Row>
                  <Row>
                    <img
                      className="captcha-image"
                      src={`data:image/png;base64,${captcha.png}`}
                      style={{ marginBottom: '5%', width: '100%' }}
                    />
                  </Row>
                  <Row>
                    {loading ? (
                      <Spinner animation="border" role="status" />
                    ) : (
                      <Button variant="primary" onClick={handleFaucetButtonClick} style={{ width: '100%', fontSize: 'small' }}>
                        Get test RBTC
                      </Button>
                    )}
                  </Row>
                </Container>
              </FeatureCard>
            </Col>
          </Row>
        </Container>
      </body>
    </div>
  );
}

export default App;
