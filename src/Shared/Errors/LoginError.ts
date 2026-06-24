export class UserResponses extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserResponses";

    Object.setPrototypeOf(this, UserResponses.prototype);
  }
}
