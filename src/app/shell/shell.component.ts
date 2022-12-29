import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../core/authentication/authentication.service';
import { CredentialsService } from '../core/authentication/credentials.service';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-shell',
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent {

  showLoader = false;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private credentialsService: CredentialsService,
    private authenticationService: AuthenticationService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.loaderService.loaderSubject.subscribe((value: boolean) => {
      this.showLoader = value;
      changeDetectorRef.detectChanges();
    });
  }

  get username() {
    return this.credentialsService.credentials?.username;
  }

  logout() {
    this.authenticationService.logout();
    this.router.navigate(['login']);
  }
}
