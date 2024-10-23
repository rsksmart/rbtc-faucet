import logger from '../utils/logger';

class ValidationStatus {
  errorMessages: string[];

  constructor(errorMessages: string[]) {
    this.errorMessages = errorMessages;
  }

  logErrors() {
    this.errorMessages.forEach(e => logger.error(e));
  }

  valid() {
    return this.errorMessages.length == 0;
  }
}

export default ValidationStatus;
