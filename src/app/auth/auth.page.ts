import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Observable } from 'rxjs';
import {
  AuthenticationService,
  AuthResponseData,
} from './authentication.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;
  constructor(
    private authService: AuthenticationService,
    private router: Router,
    private loadingCtr: LoadingController,
    private alertCtr: AlertController
  ) {}

  ngOnInit() {}

  authenticte(email: string, password: string) {
    this.isLoading = true;
    this.loadingCtr
      .create({ keyboardClose: true, message: 'Logging In...' })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        if (this.isLogin) {
          authObs = this.authService.login(email, password);
        } else {
          authObs = this.authService.singUp(email, password);
        }

        //Validating login state
        authObs.subscribe(
          (responseData) => {
            console.log(responseData);

            this.router.navigateByUrl('/places/tabs/search');
            this.isLoading = false;
            loadingEl.dismiss();
          },
          (errorRes) => {
            console.log(errorRes);
            this.isLoading = false;
            loadingEl.dismiss();
            const code = errorRes.error.error.message;
            let message = 'Could not sign you up, please try again';
            if (code === 'EMAIL_EXISTS') {
              message = 'This email already exist';
            } else if (
              code === 'EMAIL_NOT_FOUND' ||
              code === 'INVALID_PASSWORD'
            ) {
              message = 'Invalid Credentials';
            }

            this.showAlert(message);
          }
        );
      });
  }

  onSubmitAuth(authForm: NgForm) {
    if (!authForm.valid) {
      return;
    }

    const email = authForm.value.email;
    const password = authForm.value.password;
    console.log(email, password);

    this.authenticte(email, password);

    //Clear after successful validation
    authForm.resetForm();
  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

  private showAlert(messageToShow: string) {
    this.alertCtr
      .create({
        header: 'There was an error',
        message: messageToShow,
        buttons: ['Ok'],
      })
      .then((alertEl) => alertEl.present());
  }
}
