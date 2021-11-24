import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private _userIsAuthenticated = true;
  constructor() { }

  get userIsAuthenticated() {
    return this._userIsAuthenticated;
  }

  login() {
    this._userIsAuthenticated = true;
  }

  logOut() {
    this._userIsAuthenticated = false;
  }
}
