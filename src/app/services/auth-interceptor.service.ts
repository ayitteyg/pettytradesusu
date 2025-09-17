import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { NotificationService } from './notification.service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthService,
    private notification: NotificationService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  // Bypass token for auth routes
  if (req.url.includes('/auth-signin/') || req.url.includes('/auth-signup/') || req.url.includes('/token/refresh/')) {
    return next.handle(req);
  }

  return this.authService.getValidAccessToken().pipe(
    switchMap((token) => {
      if (token) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`
          }
        });
        return next.handle(authReq);
      } else {
        // No valid token, logout or navigate to login
        this.authService.logout();

  
        this.notification.info("Session expired. Please log in again.")
        return throwError(() => new Error(
          'Session expired. Please log in again.'
        ));

      }
    })
  );
}

}
