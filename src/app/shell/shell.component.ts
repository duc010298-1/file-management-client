import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { CredentialsService } from '../core/authentication/credentials.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {

  constructor(
    private router: Router,
    private credentialsService: CredentialsService,
    private authenticationService: AuthenticationService,
  ) { }

  get username() {
    return this.credentialsService.credentials?.username;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }
}
