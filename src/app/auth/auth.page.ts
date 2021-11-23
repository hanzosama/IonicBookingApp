import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
isLoading = false;
  constructor(private authService: AuthenticationService, private router: Router) { }

  ngOnInit() {
  }

  onLogIn() {
    this.isLoading = true;
    this.authService.login();
    setTimeout(() => {
      this.router.navigateByUrl('/places/tabs/search');
      this.isLoading = false;
    }, 1500);
  }


}
