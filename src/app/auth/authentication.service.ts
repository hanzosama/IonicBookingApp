/* eslint-disable no-underscore-dangle */
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Storage } from '@capacitor/storage';
import { BehaviorSubject, from } from 'rxjs';
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
export class AuthenticationService implements OnDestroy {
  private _user = new BehaviorSubject<UserModel>(null);
  private activeLogoutTimer: any;
  constructor(private httpClient: HttpClient) {}

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

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

  get token() {
    return this._user.asObservable().pipe(
      map((user) => {
        if (!user) {
          return null;
        }
        return user.token;
      })
    );
  }

  autoLogin() {
    return from(Storage.get({ key: 'AuthData' })).pipe(
      map((storeData) => {
        if (!storeData || !storeData.value) {
          return null;
        }
        const parseData = JSON.parse(storeData.value) as {
          userID: string;
          token: string;
          tokenExpDate: string;
          email: string;
        };

        const expirationDate = new Date(parseData.tokenExpDate);
        if (expirationDate <= new Date()) {
          return null;
        }

        const user = new UserModel(
          parseData.userID,
          parseData.email,
          parseData.token,
          expirationDate
        );

        return user;
      }),
      tap((user) => {
        if (user) {
          this._user.next(user);
          this.autoLogout(user.tokenDuration);
        }
      }),
      map((user) => !!user)
    );
  }

  autoLogout(duaration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this.activeLogoutTimer = setTimeout(() => {
      this.logOut();
    }, duaration);
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
    return this.httpClient
      .post<AuthResponseData>(
        environment.authenticationSignInURL +
          `?key=${environment.googleApiKey}`,
        {
          email: emailEntered,
          password: passwordEntered,
          returnSecureToken: true,
        }
      )
      .pipe(tap(this.setuserData.bind(this))); // This is similar
  }

  logOut() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
    this._user.next(null);
    this.removeAuthData();
  }

  private setuserData(authData: AuthResponseData) {
    const expirationTime = new Date().getTime() + +authData.expiresIn * 1000;
    const expirationTokenDate = new Date(expirationTime);
    const user = new UserModel(
      authData.localId,
      authData.email,
      authData.idToken,
      expirationTokenDate
    );
    this._user.next(user);
    this.autoLogout(user.tokenDuration);
    this.storeAuthData(
      authData.localId,
      authData.idToken,
      expirationTokenDate.toISOString(),
      authData.email
    );
  }

  private storeAuthData(
    userID: string,
    token: string,
    tokenExpDate: string,
    email: string
  ) {
    const data = JSON.stringify({ userID, token, tokenExpDate, email });
    Storage.set({ key: 'AuthData', value: data });
  }

  private removeAuthData() {
    Storage.remove({ key: 'AuthData' });
  }
}
