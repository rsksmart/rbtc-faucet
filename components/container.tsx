import React, { useEffect, useRef, useState } from 'react'
import axios from 'axios';
import Swal, { SweetAlertOptions } from 'sweetalert2';
import { apiUrl, siteKey, tagManagerId } from '../utils/env-util';
import { DispenseResponse } from '../types/types.d';
import Navigation from './navigation'
import Carousel from './carousel'
import Footer from './footer'
import Faucet, { FaucetProps } from './faucet'
import TagManager from 'react-gtm-module';
import ReCAPTCHA from "react-google-recaptcha";

function Container() {
  const captchaValue = useRef<ReCAPTCHA>(null);
  const [dispenseAddress, setDispenseAddress] = useState('');
  const [siteKeyCaptcha, setSiteKeyCaptcha] = useState('');

  useEffect(() => {
    setSiteKeyCaptcha(siteKey());
  }, []);

  //Handles
  const handleFaucetButtonClick = async () => {
    try {
      const swalSetup = (data: DispenseResponse): SweetAlertOptions => {
        return {
          background: '#252525',
          titleText: data.titleText,
          html: data.text,
          type: data.type,
          customClass: {
            confirmButton: 'btn btn-outline btn-swal',
          },
          onClose: () => {
            if (data.dispenseComplete) {
              setDispenseAddress('');
            }
          }
        };
      };

      Swal.fire({
        background: '#252525',
        title: 'Sending RBTCs',
        text: "You'll need to wait about 30 seconds while the transaction is being mined",
        padding: '5%',
        allowOutsideClick: false,
        confirmButtonColor: '#00E482',
        onBeforeOpen: () => {
          Swal.showLoading();
          axios
            .post(apiUrl() + '/dispense', {
              dispenseAddress,
              captcha: {
                token: captchaValue.current.getValue(),
              }
            })
            .then((res: any) => {
              const data: DispenseResponse = res.data;
              Swal.fire(swalSetup(data));
            })
            .catch(async (e: any) => {
              //codes 409 or 500
              console.error(e);
              const data: DispenseResponse = e.response.data ? e.response.data : e;
              Swal.fire(swalSetup(data));
            });
        }
      });
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'Error', type: 'error', text: 'Unexpected error, please try again later.' });
    }
  };
  
  const handleDispenseAddressChange = (event: any) => {
    setDispenseAddress(event.target.value);
  };


  //Props
  const faucetPropsDesktop: FaucetProps = {
    dispenseAddress,
    captchaValue,
    onAddressChange: handleDispenseAddressChange,
    onDispenseClick: handleFaucetButtonClick,
    siteKeyCaptcha,
  };
  return (
    <>
      <div className='container'>
        <Navigation />
        <div className='content-body'>
          <div className='title-faucet'>
            <div className='rootstock'>Rootstock</div>
            <div className='faucet'>Faucet</div>
          </div>
          <div className='container-faucet'>
            <Faucet {...faucetPropsDesktop} />
            <Carousel />
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

Container.getInitialProps = async function() {
  const tagManagerArgs = {
    id: tagManagerId()
  };
  TagManager.initialize(tagManagerArgs);

  return {};
};
export default Container
