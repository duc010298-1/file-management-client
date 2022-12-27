import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { AuthenticationService, LoginContext } from '../core/authentication/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;
  isLoading = false;
  isLoginFailed = false;
  subscription: Subscription;

  constructor(
    private authenticationService: AuthenticationService,
    private formBuilder: FormBuilder,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [true]
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Login');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  login() {
    this.isLoginFailed = false;
    const loginContext: LoginContext = {
      username: this.loginForm.get('username')!.value,
      password: this.loginForm.get('password')!.value,
      remember: this.loginForm.get('rememberMe')!.value
    };

    if (!this.isLoading) {
      this.isLoading = true;
      this.subscription = this.authenticationService
        .login(loginContext)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          })
        )
        .subscribe({
          next: () => {
            this.route.queryParams.subscribe(params => {
              this.router.navigate([params['redirect'] || '/'], { replaceUrl: true })
            });
          },
          error: () => {
            this.isLoginFailed = true;
          }
        });
    }
  }
}
