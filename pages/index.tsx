import React, { useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { DispenseResponse } from '../types/types.d';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';
import { apiUrl, newCaptchaUrl } from '../utils/env-util';
import RskCard from '../components/rsk-card';
import ReactCardCarousel from 'react-card-carousel';
import Faucet from '../components/faucet';
import RskLinkCard from '../components/rsk-link-card';
import '../assets/styles/globals.css';

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
          <img className="logo ml-5" />
        </Navbar.Brand>
      </Navbar>
      <div className="app-body vertical-center">
        <Container className="m-0 p-0 w-100" style={{ maxWidth: '80%' }}>
          <Row className="w-100" style={{ width: '100%' }}>
            <Col>
              <Faucet
                captcha={captcha}
                loading={loading}
                dispenseAddress={dispenseAddress}
                captchaValue={captchaValue}
                onAddressChange={handleDispenseAddressChange}
                onCaptchaValueChange={handleCaptchaValueChange}
                onDispenseClick={handleFaucetButtonClick}
              />
            </Col>
            <Col>
              <Container className="h-100 w-100">
                <ReactCardCarousel autoplay={true} autoplay_speed={5000}>
                  <Row>
                    <RskLinkCard
                      link="https://developers.rsk.co/"
                      icon={<img className="devportal-icon" />}
                      title="DevPortal"
                      backgroundColor="#00b41f"
                      description="For developers by developers"
                    />
                  </Row>
                  <Row>
                    <RskLinkCard
                      link="https://developers.rsk.co/develop/apps/wallets/"
                      icon={<img className="wallet-icon" />}
                      title="Wallets"
                      backgroundColor="black"
                      description="Try RSK with these wallets"
                    />
                  </Row>
                  <Row>
                    <RskLinkCard
                      link="https://developers.rsk.co/tutorials/"
                      icon={<img className="tutorials-icon" />}
                      title="Tutorials"
                      backgroundColor="#f26122"
                      description="How to develop on RSK"
                    />
                  </Row>
                </ReactCardCarousel>
              </Container>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default App;
