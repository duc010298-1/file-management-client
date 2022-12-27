import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { CredentialsService } from '../authentication/credentials.service';
import { ConstantDef } from '../constant-def';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  constructor(
    private credentialsService: CredentialsService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // add auth header with jwt if user is logged in and request is to api url
    if (this.credentialsService.isAuthenticated() && this.credentialsService.credentials && ConstantDef.API_URL) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.credentialsService.credentials.access}`
        }
      });
    }
    return next.handle(request);
  }
}
