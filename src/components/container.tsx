'use client'
import Swal, { SweetAlertOptions } from 'sweetalert2';
import Navigation from './navigation'
import Footer from './footer'
import Faucet, { FaucetProps } from './faucet'
import TagManager, { TagManagerArgs } from 'react-gtm-module';
import ReCAPTCHA from "react-google-recaptcha";
import Carousel from './Carousel';
import { ChangeEvent, useRef, useState } from 'react';
import { DispenseResponse } from '@/types/types';
import { dispense } from '@/app/lib/action';
import { getPublicEnv } from '@/constants';

const publicEnv = getPublicEnv();
function Container() {
  const captchaValue = useRef<ReCAPTCHA>(null);
  const [dispenseAddress, setDispenseAddress] = useState<string>('');
  const [isMainnetRns, setIsMainnetRns] = useState<boolean>(false);
  //Handles
  const handleFaucetButtonClick = async (code: string | undefined) => {
    try {
      const swalSetup = (data: DispenseResponse): SweetAlertOptions => {
        return {
          background: '#252525',
          title: data.title,
          html: data.text,
          icon: data.type,
          customClass: {
            confirmButton: 'btn btn-outline btn-swal',
            loader: '#00E482'
          },
          willClose: () => {
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
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading(null);
          dispense({
            address: dispenseAddress.toLowerCase(),
            promoCode: code,
            captcha: {
              token: captchaValue.current!.getValue()!
            },
            isMainnetRns: isMainnetRns
          })
            .then((res: DispenseResponse | undefined) => {
              const data: DispenseResponse = res!;
              Swal.fire(swalSetup(data));
            })
            .catch(async (e: DispenseResponse | undefined) => {
              //codes 409 or 500
              console.error(e);
              const data: DispenseResponse = e!;
              Swal.fire(swalSetup(data));
            });
        }
      });
    } catch (e) {
      console.error(e);
      Swal.fire({ title: 'Error', icon: 'error', text: 'Unexpected error, please try again later.' });
    }
  };
  
  const handleDispenseAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setDispenseAddress(event.target.value);
  };


  //Props
  const faucetPropsDesktop: FaucetProps = {
    dispenseAddress,
    captchaValue,
    onAddressChange: handleDispenseAddressChange,
    onDispenseClick: handleFaucetButtonClick,
    isMainnetRns: isMainnetRns,
    setIsMainnetRns: setIsMainnetRns
  };
  return (
    <>
      <div className='container'>
        <Navigation />
        <div className='content-body'>
          <div className='title-faucet'>
            <div className='rootstock'>Rootstock</div>
            <div className='rbtc'>RBTC</div>
            <div className='faucet'>Faucet</div>
          </div>
          <div className='container-faucet'>
            <Faucet {...faucetPropsDesktop} />
            <Carousel />
          </div>
        </div>
        <div className='content-message'>
          <i>The Rootstock Faucet implements some controls which at times create unintended blockers for obtaining TRBTC.  If you are experiencing any problems, please head into our <a href="https://discord.com/channels/842021106956238848/1123675841369489438" target="_blank">Discord</a>, and our rootstock contributors can help source test RBTC in another way.</i>
        </div>
      </div>
      <Footer />
    </>
  )
}

Container.getInitialProps = async function() {
  const tagManagerArgs: TagManagerArgs = {
    gtmId: publicEnv.TAG_MANAGER_ID
  };
  TagManager.initialize(tagManagerArgs);

  return {};
};
export default Container
