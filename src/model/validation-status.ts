
class ValidationStatus {
  errorMessages: string[];

  constructor(errorMessages: string[]) {
    this.errorMessages = errorMessages;
  }

  valid() {
    return this.errorMessages.length == 0;
  }
}

export default ValidationStatus;
