export class UserResponse extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserResponse";

    Object.setPrototypeOf(this, UserResponse.prototype);
  }
}
