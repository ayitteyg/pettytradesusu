import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  currentUserValue: any;

  constructor(private http: HttpClient, private router: Router) {}

  signup(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth-signup/`, data).pipe(
      map((res:any)=>{
        localStorage.setItem('first_name', res.first_name);
      })
    );
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth-signin/`, { username, password }).pipe(
      map((res: any) => {
        localStorage.setItem('access_token', res.access);
        localStorage.setItem('refresh_token', res.refresh);
        localStorage.setItem('username', res.username);
        localStorage.setItem('church', res.church);
        localStorage.setItem('userId', res.userId);
        localStorage.setItem('first_name', res.first_name);
        localStorage.setItem('is_officer', res.is_officer);
        return res;
      }),
      catchError(this.handleError)
    );
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getUserId(): string | null {
    return localStorage.getItem('userId');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  getFirstName(): string | null {
    return localStorage.getItem('first_name');
  }

  private handleError(error: HttpErrorResponse) {
    console.error('AuthService error:', error);
    return throwError(() => error);
  }

  refreshToken(): Observable<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) return of(null);

    return this.http.post<any>(`${this.apiUrl}/api/token/refresh/`, { refresh }).pipe(
      map(response => {
        localStorage.setItem('access_token', response.access);
        return response.access;
      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  getValidAccessToken(): Observable<string | null> {
    const token = this.getAccessToken();
    if (!token || this.isTokenExpired(token)) {
      return this.refreshToken();
    }
    return of(token);
  }



  // Decode and check expiry
  private isTokenExpired(token: string): boolean {
    try {
      const [, payload, ] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      const exp = decoded.exp;
      const now = Math.floor(Date.now() / 1000);
      return exp < now;
    } catch {
      return true;
    }
  }



  
}
