import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = false;
  constructor(private authService: AuthenticationService, private router: Router, private loadingCtr: LoadingController) { }

  ngOnInit() {
  }

  onLogIn() {
    this.isLoading = true;
    this.authService.login();
    this.loadingCtr.create({ keyboardClose: true, message: 'Logging In...' }).then(loadingEl => {
      loadingEl.present();
      setTimeout(() => {
        this.router.navigateByUrl('/places/tabs/search');
        this.isLoading = false;
        loadingEl.dismiss();
      }, 1500);
    });
  }

  onSubmitAuth(authForm: NgForm) {
    if (!authForm.valid) {
      return;
    }

    const email = authForm.value.email;
    const password = authForm.value.password;
    console.log(email, password);

    if (this.isLogin) {

    } else { //Singup

    }

    //Clear after successful validation
    authForm.resetForm();


  }

  onSwitchAuthMode() {
    this.isLogin = !this.isLogin;
  }

}
