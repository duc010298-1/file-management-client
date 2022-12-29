import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { finalize, Observable, tap } from 'rxjs';
import { LoaderService } from 'src/app/shell/loader.service';

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

  constructor(
    private loaderService: LoaderService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.showLoader();
    return next.handle(request).pipe(
      finalize(() => {
        this.onEnd();
      })
    );
  }

  private onEnd(): void {
    this.hideLoader();
  }

  private showLoader(): void {
    this.loaderService.changeLoaderState(true);
  }

  private hideLoader(): void {
    this.loaderService.changeLoaderState(false);
  }
}
