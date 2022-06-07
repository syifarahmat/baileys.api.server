import ExtendableError from './extendable';

export default class APIError extends ExtendableError {
  constructor({ message, errors, status = 500 }) {
    super({
      message,
      errors,
      status,
    });
  }
}