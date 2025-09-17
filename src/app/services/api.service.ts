import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, retry, timeout } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';
import { formatDate } from '@angular/common';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiUrl = environment.apiUrl;
 //private apiUrl = 'http://127.0.0.1:8000/api'; // Base URL // Update with your Django API URL

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }


  //get memberdashboard data
  
getDashboardData() {
  return this.http.get<any>(`${this.apiUrl}/api/member-dashboard/`);
}


submitTransaction(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/transactions/`, data);
}

getAllMembers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/all-members/`);
}

getUserTransactions(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/api/user-transactions/`);
}


addLoanRequest(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/loans/`, data);
}


getChurches(): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/churches/`);
}

updateProfile(data: any): Observable<any> {
  return this.http.put(`${this.apiUrl}/api/member/profile/`, data);
}

getProfile(): Observable<any> {
  return this.http.get(`${this.apiUrl}/api/member/profile/`);
}


addLoanRepayment(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/loan-repayments/`, data);
}

getLoanSummary(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/loan-summary/`);
}


getLoanHistory(): Observable<any> {
  return this.http.get<any>(`${this.apiUrl}/api/loan-history/`);
}


// New methods for approval/rejection
  approveLoan(loanId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/loans/${loanId}/approve/`, {});
  }

  rejectLoan(loanId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/loans/${loanId}/reject/`, {});
  }

  // Add method to fetch loans (for the approval section)
  getLoanList(): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/loan-list/`);
  }

  getActiveLoan(memberId: number) {
  return this.http.get<any>(`/api/members/${memberId}/active-loan/`);
}

  getPendingLoan(memberId: number) {
  return this.http.get<any>(`/api/members/${memberId}/pending-loan/`);
}


changePassword(data: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/api/member/change-password/`, data);
}

  initiateMomoPayment(paymentData: {
    amount: string;
    network: string;
    phone_number: string;
    
  }): Observable<{
    status: string;
    reference: string;
    authorization_url:string ;
    message: string;
  }> {
    return this.http.post<{
    status: string;
    reference: string;
    authorization_url:string ;
    message: string;
    }>(`${this.apiUrl}/api/connect-paystack/`, paymentData);
  }


  verifyPayment(reference: string): Observable<{
  status: string;
  message: string;
  amount?: number;
  reference?: string;
}> {
  return this.http.get<{
    status: string;
    message: string;
    amount?: number;
    reference?: string;
  }>(`${this.apiUrl}/api/verify-transaction/?reference=${reference}`);
}


}


