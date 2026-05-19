import { getServerEnv } from '@/constants';
import { CaptchaSolutionRequest, CaptchaSolutionResponse } from '../types/types';
import { logFaucetError } from './logger';
import axios from 'axios';

const serverEnv = getServerEnv();
class CaptchaSolver {
  async solve(captcha: CaptchaSolutionRequest): Promise<CaptchaSolutionResponse> {
    try {
      if (captcha.token == '') captcha.token = "doesn't matter";
      
      const postData = `secret=${encodeURIComponent(serverEnv.SECRET_VERIFY_CAPTCHA)}&response=${encodeURIComponent(captcha.token)}`;

      const url = serverEnv.GOOGLE_CAPTCHA_URL;

      const res = await axios.post(url, postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const result: CaptchaSolutionResponse = res?.data;

      return result;
    } catch (e) {
      logFaucetError('captcha.verify_request_failed', e);
      throw new Error(`${e}`);
    }
  }
}

export default CaptchaSolver;
