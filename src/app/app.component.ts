import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './auth/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  constructor(private authService: AuthenticationService, private router: Router) { }

  onLogout() {
    this.authService.logOut();
    this.router.navigateByUrl('/auth');

  }
}
