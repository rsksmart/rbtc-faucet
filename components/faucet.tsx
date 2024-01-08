import React from 'react';
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
  return (
    <div className='content-form'>
      <div className="title-form">Fill to get your tokens</div>
      <div className='faucet-form'>
        <input
          className="faucet-control rounded-rsk"
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
          className="faucet-control rounded-rsk"
        />
        <div>
          {isLoadingCaptcha(props.captcha.id) ? (
            <img className="faucet-captcha-image rounded-rsk" src={`data:image/png;base64,${props.captcha.png}`} />
          ) : (
            <Spinner className="faucet-captcha-spinner" animation="border" role="status" />
          )}
        </div>
        {
          <div className='content-btn'>
            <button onClick={() => props.onReloadCaptchaClick()} className="btn btn-outline btn-reload">
              {
                props.loading ? <div className="spinner"></div> : 'Reload captcha'
              }
            </button>
            <button onClick={() => props.onDispenseClick()} className="btn btn-primary">
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
