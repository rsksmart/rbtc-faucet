import { CaptchaSolutionRequest, CaptchaSolutionResponse } from '../types/types';
import { secretCaptcha, solveCaptchaUrl } from './env-util';
import logger from './logger';
import axios from 'axios';

class CaptchaSolver {
  async solve(captcha: CaptchaSolutionRequest): Promise<CaptchaSolutionResponse> {
    try {
      if (captcha.token == '') captcha.token = "doesn't matter";
      
      const postData = `secret=${encodeURIComponent(secretCaptcha())}&response=${encodeURIComponent(captcha.token)}`;

      const url = solveCaptchaUrl();

      logger.event('checking solution against captcha api, POST ' + url);

      const res = await axios.post(url, postData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      const result: CaptchaSolutionResponse = res?.data;
      console.log('captcha solver result: ', result);

      logger.event('captcha solution response ' + JSON.stringify(result));

      return result;
    } catch (e) {
      logger.error(e);
      throw new Error(`${e}`);
    }
  }
}

export default CaptchaSolver;
