import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserModel } from './user.model';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered;
}

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private _user = new BehaviorSubject<UserModel>(null);
  constructor(private httpClient: HttpClient) {}

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (!user) {
          return false;
        }
        return !!user.token;
      })
    );
  }
  get userId() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (!user) {
          return null;
        }
        return user.userId;
      })
    );
  }

  singUp(emailEntered: string, passwordEntered: string) {
    return this.httpClient
      .post<AuthResponseData>(
        environment.authenticationSignUpURL +
          `?key=${environment.googleApiKey}`,
        {
          email: emailEntered,
          password: passwordEntered,
          returnSecureToken: true,
        }
      )
      .pipe(
        tap((authData) => {
          this.setuserData(authData);
        })
      );
  }

  login(emailEntered: string, passwordEntered: string) {
    return this.httpClient.post<AuthResponseData>(
      environment.authenticationSignInURL + `?key=${environment.googleApiKey}`,
      {
        email: emailEntered,
        password: passwordEntered,
        returnSecureToken: true,
      }
    ).pipe(tap(this.setuserData.bind(this))); // This is similar
  }

  logOut() {
    this._user.next(null);
  }

  private setuserData(authData: AuthResponseData) {
    const expirationTime = new Date().getTime() + +authData.expiresIn * 1000;
    const expirationTokenDate = new Date(expirationTime);
    this._user.next(
      new UserModel(
        authData.localId,
        authData.email,
        authData.idToken,
        expirationTokenDate
      )
    );
  }
}
