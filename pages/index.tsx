import React, { useState, useEffect } from 'react';
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import ReactCardCarousel from 'react-card-carousel';
import RskLinkCard from '../components/rsk-link-card';
import withSizes from 'react-sizes';
import Faucet, { FaucetProps } from '../components/faucet';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { apiUrl, newCaptchaUrl } from '../utils/env-util';
import { DispenseResponse } from '../types/types.d';
import Fade from 'react-reveal/Fade';
import '../assets/styles/index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/globals.css';

function App({ isMobile }) {
  //Hooks
  const [captcha, setCaptcha] = useState({ id: '-1', png: '-1' });
  const [dispenseAddress, setDispenseAddress] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCaptcha();
  }, []);

  //Handles
  const handleFaucetButtonClick = async () => {
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

    setLoading(true);
    axios
      .post(apiUrl() + '/dispense', {
        dispenseAddress,
        captcha: {
          solution: captchaValue,
          id: captcha.id
        }
      })
      .then((res: any) => {
        setCaptchaValue('');
        setLoading(false);
        const data: DispenseResponse = res.data;
        Swal.fire(swalSetup(data));
      })
      .catch((e: any) => {
        //codes 409 or 500
        setCaptchaValue('');
        setLoading(false);
        console.error(e);
        console.error(JSON.stringify(e.response));
        const data: DispenseResponse = e.response.data ? e.response.data : e;
        Swal.fire(swalSetup(data));
      });
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

  const faucetPropsDesktop: FaucetProps = {
    captcha: captcha,
    loading: loading,
    dispenseAddress: dispenseAddress,
    captchaValue: captchaValue,
    onAddressChange: handleDispenseAddressChange,
    onCaptchaValueChange: handleCaptchaValueChange,
    onDispenseClick: handleFaucetButtonClick
  };
  const reactCardCarouselProps = {
    autoplay: true,
    autoplay_speed: 5000
  };
  const devportalLinkCardProps = {
    link: 'https://developers.rsk.co/',
    icon: <img className="devportal-icon" />,
    title: 'DevPortal',
    backgroundColor: '#00b41f',
    description: 'For developers by developers'
  };
  const tutorialLinkCardProps = {
    link: 'https://developers.rsk.co/tutorials/',
    icon: <img className="tutorials-icon" />,
    title: 'Tutorials',
    backgroundColor: '#f26122',
    description: 'How to develop on RSK'
  };
  const walletsLinkCardProps = {
    link: 'https://developers.rsk.co/develop/apps/wallets/',
    icon: <img className="wallet-icon" />,
    title: 'Wallets',
    backgroundColor: 'black',
    description: 'Try RSK with these wallets'
  };

  return (
    <div className="custom-body">
      <Fade top>
        <Navbar className="navbar-rsk">
          <Navbar.Brand className="navbar-brand-rsk">
            <img className="logo ml-5" />
          </Navbar.Brand>
        </Navbar>
      </Fade>
      <div className="app-body">
        <Container className="m-0 p-0 w-100 container-rsk">
          <Fade bottom>
            <Row className="w-100">
              <Col>
                <Faucet {...faucetPropsDesktop} />
              </Col>
              {!isMobile ? (
                <Col>
                  <Container className="h-100 w-100">
                    <ReactCardCarousel {...reactCardCarouselProps}>
                      <Row>
                        <RskLinkCard {...devportalLinkCardProps} />
                      </Row>
                      <Row>
                        <RskLinkCard {...walletsLinkCardProps} />
                      </Row>
                      <Row>
                        <RskLinkCard {...tutorialLinkCardProps} />
                      </Row>
                    </ReactCardCarousel>
                  </Container>
                </Col>
              ) : (
                <></>
              )}
            </Row>
          </Fade>
        </Container>
      </div>
    </div>
  );
}

const mapSizesToProps = ({ width }) => ({
  isMobile: width < 768
});

export default withSizes(mapSizesToProps)(App);
