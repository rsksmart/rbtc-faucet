import { ValidationError } from '@/utils/validations';

class ValidationStatus {
  userMessages: string[];
  logCodes: string[];

  constructor(errors: ValidationError[]) {
    this.userMessages = errors.map((error) => error.userMessage);
    this.logCodes = errors.map((error) => error.logCode);
  }

  valid() {
    return this.userMessages.length === 0;
  }
}

export default ValidationStatus;
