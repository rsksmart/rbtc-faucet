import React, { ChangeEvent, RefObject, useState } from 'react';
import ReCAPTCHA from "react-google-recaptcha";

export interface FaucetProps {
  siteKeyCaptcha: string
  dispenseAddress: string;
  captchaValue: RefObject<ReCAPTCHA>;
  onAddressChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDispenseClick: () => void;
}

const Faucet = (props: FaucetProps) => {
  const [error, setError] = useState({
    address: false,
    captchaValue: false,
  });

  const handleForm = () => {
    // validate form
    setError({ address: false, captchaValue: false });
    const addressError = !props.dispenseAddress;
    const captchaError = !props.captchaValue.current!.getValue();
    if (addressError || captchaError) {
      setTimeout(() => { 
        setError({ address: addressError, captchaValue: captchaError });
      }, 100);
      return;
    }

    props.onDispenseClick();
    setError({ address: false, captchaValue: false });
  }

  return (
    <div className='content-form'>
      <div className='faucet-form'>
        <input
          className={`faucet-control rounded-rsk ${error.address ? 'error' : '' }`}
          type="text"
          placeholder="Find address or RNS domain to receive tokens ... "
          value={props.dispenseAddress}
          onChange={props.onAddressChange}
        />
        <div className='captcha-content'>
          { props.siteKeyCaptcha ?
            <ReCAPTCHA
              ref={props.captchaValue}
              sitekey={props.siteKeyCaptcha}
              theme='dark'
              className={`re-captcha ${error.captchaValue ? 'error' : '' }`}
            />
            :
            <span className='spinner'></span>
          }
        </div>
        <div className='content-btn'>
          <button onClick={handleForm} className="btn btn-primary btn-middle">
            Get test RBTC
          </button>
        </div>
      </div>
    </div>
  );
};

export default Faucet;
