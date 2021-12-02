/* eslint-disable no-underscore-dangle */
export class UserModel {
  constructor(
    public userId: string,
    public email: string,
    private _token: string,
    private tokenExpDate: Date
  ) {}

  get token() {
    if (!this.tokenExpDate || this.tokenExpDate <= new Date()) {
      return null;
    } else {
     return this._token;
    }
  }
}
