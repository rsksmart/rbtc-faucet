import { getServerEnv } from '@/constants';
import { CaptchaSolutionRequest, CaptchaSolutionResponse } from '../types/types';
import logger from './logger';
import axios from 'axios';

const serverEnv = getServerEnv();
class CaptchaSolver {
  async solve(captcha: CaptchaSolutionRequest): Promise<CaptchaSolutionResponse> {
    try {
      if (captcha.token == '') captcha.token = "doesn't matter";
      
      const postData = `secret=${encodeURIComponent(serverEnv.SECRET_VERIFY_CAPTCHA)}&response=${encodeURIComponent(captcha.token)}`;

      const url = serverEnv.GOOGLE_CAPTCHA_URL;

      logger.event('checking solution against captcha api, POST ' + url);

      const res = await axios.post(url, postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const result: CaptchaSolutionResponse = res?.data;

      logger.event('captcha solution response ' + JSON.stringify(result));

      return result;
    } catch (e) {
      logger.error(e);
      throw new Error(`${e}`);
    }
  }
}

export default CaptchaSolver;
