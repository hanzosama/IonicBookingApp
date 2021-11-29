import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _userIsAuthenticated = true;
  private _userId = 'u2';
  constructor() {}

  get userIsAuthenticated() {
    return this._userIsAuthenticated;
  }
  get userId() {
    return this._userId;
  }

  login() {
    this._userIsAuthenticated = true;
  }

  logOut() {
    this._userIsAuthenticated = false;
  }
}
