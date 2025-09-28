import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-loans',
  standalone: false,
  templateUrl: './loans.component.html',
  styleUrl: './loans.component.css'
})



export class LoansComponent implements OnInit {
  showHistory = false;
  activeLoan: any = null;
  hasPendingLoan: boolean = false;
  loanHistory: any[] = [];
  showLoanRequest: boolean = false;
  activePage: string = ''; // Default page
  toggleRequestForm: boolean = false;
  memberid: number = 0;

  loading = false;
  
  setActivePage(page: string) {
    this.toggleRequestForm = !this.toggleRequestForm
    this.activePage = page;
    
  }


  
 

  constructor(
    private apiservice: ApiService,
    private router: Router) 
   {}

  ngOnInit(): void {
    this.loading = true
    this.apiservice.getLoanSummary().subscribe({
      next: (data) => {
        console.log(data)
        this.activeLoan = data.activeLoan;
        this.loanHistory = data.loanHistory;
        this.loadHistory()
        this.loading = true
      },
      error: (err) => {
        console.error('Failed to fetch loan summary:', err);
      }
    });
    
  }


  get currentBalance(): number {
    return this.activeLoan ? this.activeLoan.totalRepayments - this.activeLoan.totalAmount : 0;
  }

  get progressPercentage(): number {
    return this.activeLoan ? (this.activeLoan.totalRepayments / this.activeLoan.totalAmount) * 100  : 0;
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }


  loadHistory() {
    this.loading = true
    this.apiservice.getLoanHistory().subscribe(data => {
      this.loanHistory = data;
      
      // Check if any loan has status 'pending'
      this.hasPendingLoan = data.some((loan: { status: string; }) => loan.status === 'pending');

      this.loading = false
      
      console.log('Loan History:', data);
      console.log('Has Pending Loan:', this.hasPendingLoan);
    });
  }

 



requestNewLoan(): void {
    // Navigate to loan request page
    this.router.navigate(['/loan-request']);
  }

 

   getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-success bg-opacity-2 text-light';
      case 'rejected':
        return 'bg-danger bg-opacity-2 text-black';
      case 'pending':
        return 'bg-warning bg-opacity-2 text-black';
      case 'cancelled':
        return 'bg-primary bg-opacity-2 text-black';
      case 'completed':
        return 'bg-primary bg-opacity-2 text-black';
      default:
        return 'bg-secondary bg-opacity-10 text-secondary';
    }
  }

}
