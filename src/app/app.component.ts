import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthenticationService } from './auth/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previewsAuthState = false;

  constructor(
    private authService: AuthenticationService,
    private router: Router
  ) {}
  ngOnDestroy(){
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  ngOnInit(){
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if(!isAuth && this.previewsAuthState !==isAuth){
      this.router.navigateByUrl('/auth');
      }
      this.previewsAuthState = isAuth;
    });
  }

  onLogout() {
    this.authService.logOut();
  }
}
