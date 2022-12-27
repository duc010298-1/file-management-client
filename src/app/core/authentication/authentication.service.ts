import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { ConstantDef } from '../constant-def';
import { Credentials, CredentialsService } from './credentials.service';

export interface LoginContext {
  username: string;
  password: string;
  remember?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private loginUrl = ConstantDef.API_URL + 'api/token/';

  constructor(
    private http: HttpClient,
    private credentialsService: CredentialsService,
  ) { }

  /**
 * Authenticates the user.
 * @param context The login parameters.
 * @return The user credentials.
 */
  login(context: LoginContext): Observable<Credentials> {
    const formData = new FormData();
    formData.append('username', context.username);
    formData.append('password', context.password);

    return this.http.post(this.loginUrl, {
      username: context.username,
      password: context.password
    })
      .pipe(map((data: any) => {
        const credential = {
          refresh: data.refresh,
          access: data.access,
          username: context.username
        };
        // login successful if there's a jwt token in the response
        if (credential && credential.access) {
          // store user details and jwt token in local storage to keep user logged in between page refreshes
          this.credentialsService.setCredentials(credential, context.remember);
        }
        return credential;
      }));
  }

  /**
   * Logs out the user and clear credentials.
   * @return True if the user was logged out successfully.
   */
  logout(): Observable<boolean> {
    // Customize credentials invalidation here
    this.credentialsService.setCredentials();
    return of(true);
  }
}
