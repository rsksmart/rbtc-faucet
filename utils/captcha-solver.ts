import { CaptchaSolutionRequest, CaptchaSolutionResponse } from '../types/types';
import { solveCaptchaUrl } from './env-util';
import logger from './logger';
import axios from 'axios';

class CaptchaSolver {
  async solve(captcha: CaptchaSolutionRequest): Promise<CaptchaSolutionResponse> {
    try {
      if (captcha.solution == '') captcha.solution = "doesn't matter";

      const url = solveCaptchaUrl() + captcha.id + '/' + captcha.solution;

      logger.event('checking solution against captcha api, POST ' + url);

      const res = await axios.post(url, captcha);
      const result: CaptchaSolutionResponse = res.data;

      logger.event('captcha solution response ' + JSON.stringify(result));

      return result;
    } catch (e) {
      logger.error(e);
      return { result: <'accepted' | 'rejected'>'rejected', reject_reason: e, trials_left: 0 };
    }
  }
}

export default CaptchaSolver;
