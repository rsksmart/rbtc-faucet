import React, { useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';

export interface FaucetProps {
  captcha: any;
  loading: boolean;
  dispenseAddress: string;
  captchaValue: string;
  onAddressChange: (event: any) => void;
  onCaptchaValueChange: (event: any) => void;
  onDispenseClick: () => void;
  onReloadCaptchaClick: () => void;
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
    const captchaError = !props.captchaValue;
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
      <div className="title-form">Fill to get your tokens</div>
      <div className='faucet-form'>
        <input
          className={`faucet-control rounded-rsk ${error.address ? 'error' : '' }`}
          type="text"
          placeholder="Find address or RNS domain to receive tokens ... "
          value={props.dispenseAddress}
          onChange={props.onAddressChange}
        />
        <input
          type="text"
          placeholder="Captcha"
          value={props.captchaValue}
          onChange={props.onCaptchaValueChange}
          className={`faucet-control rounded-rsk ${error.captchaValue ? 'error' : '' }`}
        />
        <div>
          {isLoadingCaptcha(props.captcha.id) ? (
            <img className="faucet-captcha-image rounded-rsk" src={`data:image/png;base64,${props.captcha.png}`} />
          ) : (
            <div className='container-empty-captcha'>
              <div className="spinner"></div> 
            </div>
          )}
        </div>
        {
          <div className='content-btn'>
            <button onClick={() => props.onReloadCaptchaClick()} className="btn btn-outline btn-reload">
              {
                props.loading ? <div className="spinner"></div> : 'Reload captcha'
              }
            </button>
            <button onClick={handleForm} className="btn btn-primary btn-middle">
              Get test RBTC
            </button>
          </div>
        }
      </div>
    </div>
  );
};

const isLoadingCaptcha = (id: string) => id != '-1';

export default Faucet;
