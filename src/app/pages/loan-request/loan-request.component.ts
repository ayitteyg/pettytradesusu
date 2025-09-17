import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';



@Component({
  selector: 'app-loan-request',
  standalone: false,
  templateUrl: './loan-request.component.html',
  styleUrl: './loan-request.component.css'
})
export class LoanRequestComponent implements OnInit {

  loanForm!: FormGroup;
  is_officer = false; // Set based on actual user role
  members: any[] = []; // Will be populated from service
  loanHistory: any[] = []; // Dummy data for now
  showConfirmationModal = false;
  loanPayload: any;
  loans:any[]=[];
  isSubmitting = false;
  isLoading = false;
  isProcessing = false;


   // Loan approval section
  selectedStatus = 'all';
  showApprovalDialog = false;
  currentLoanAction: { action: 'approve' | 'reject', loanId: number } | null = null;


   constructor(
  
    private fb: FormBuilder,
    private apiservice: ApiService,
    private authService: AuthService,
    private notification: NotificationService,
    private http: HttpClient,
    private router: Router
 
  )
  {
    
    // // Load dummy data
    // this.loadDummyData();
  }

  ngOnInit(): void {
    this.initializeForm();

     //get all members
      this.apiservice.getAllMembers().subscribe(data => {
      this.members = data;
        console.log(this.members)
    });

    this.loadHistory()
     this.loadLoanApplications();
   
  }


  initializeForm() {
    this.loanForm = this.fb.group({
      member: [this.authService.getUserId(), this.is_officer ? Validators.required : null],
      account_officer: [null],
      amount: ['', [Validators.required, Validators.min(100), Validators.max(50000)]],
      term: ['', [Validators.required, Validators.min(1), Validators.max(60)]], // months
      interest_rate: ['', [Validators.min(7.5), Validators.max(7.5)]], // percentage
      purpose: ['', [Validators.required, Validators.maxLength(200)]]
    });

    // Set account officer if user is one
    if (this.is_officer) {
      this.loanForm.patchValue({
        account_officer: this.authService.getUserId()
      });
    }
  }

  loadHistory() {
     //get loan history
      this.apiservice.getLoanHistory().subscribe(data => {
      this.loanHistory = data;
      console.log(this.loanHistory)
    });
  }

  
   onSubmit() {
    if (this.loanForm.invalid) {
      this.loanForm.markAllAsTouched();
      return;
    }

    // Prepare payload
    this.loanPayload = {
      ...this.loanForm.value,
      term: parseInt(this.loanForm.value.term),
      interest_rate: parseFloat('7.5'), //parseFloat(this.loanForm.value.interest_rate),
      submitted_date: new Date().toISOString()
    };

    // Show confirmation modal
    this.showConfirmationModal = true;
  }


  confirmSubmission() {
    this.isSubmitting = true;
    
    // Log the payload to console
    console.log('Loan Application Payload:', this.loanPayload);
    
    // Simulate API call
    setTimeout(() => {


      this.apiservice.addLoanRequest(this.loanPayload).subscribe({
          next: () => {
             this.isSubmitting = false;
            console.log(this.loanPayload)
            this.notification.success('Loan application submitted successfully!')
            this.showConfirmationModal = false;
            this.loanForm.reset();
            this.router.navigate(['/member-dashboard'])
            this.loadHistory()
            
          },
          error: (err) => {
          this.showConfirmationModal = false;

          //err.error.detail → Gets the detail field from DRF’s ValidationError response.
          const backendMsg = err?.error?.detail || 'Failed to record transaction.';
          this.notification.info(backendMsg);
          this.loanForm.reset();
          this.router.navigate(['/member-dashboard'])
        }
        });
    }, 1500);
  }

  cancelSubmission() {
    this.showConfirmationModal = false;
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


  get filteredLoans() {
    if (this.selectedStatus === 'all') return this.loans;
    return this.loans.filter(loan => loan.status === this.selectedStatus);
  }

  openApprovalDialog(loanId: number, action: 'approve' | 'reject') {
    this.currentLoanAction = { action, loanId };
    this.showApprovalDialog = true;
  }

  
  cancelAction() {
    this.showApprovalDialog = false;
    this.currentLoanAction = null;
  }

  getLoanStatusClass(status: string) {
    switch (status) {
      case 'active': return 'status-active';
      case 'pending': return 'status-pending';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  }


  loadLoanApplications(): void {
    this.isLoading = true;
    this.apiservice.getLoanList()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (response) => {
          this.loans = response; // Assuming API returns array of loans
        },
        error: (error) => {
          console.error('Error loading loans:', error);
         this.notification.error('failed to fetch loans');
        }
      });
  }



  confirmAction(): void {
    if (!this.currentLoanAction) return;

    const { action, loanId } = this.currentLoanAction;
    this.isProcessing = true;

    const apiCall$ = action === 'approve' 
      ? this.apiservice.approveLoan(loanId)
      : this.apiservice.rejectLoan(loanId);

    apiCall$.pipe(finalize(() => {
      this.isProcessing = false;
      this.showApprovalDialog = false;
    }))
    .subscribe({
      next: (response) => {
        console.log(`${action} successful:`, response);
        // Update local state or reload data
        this.loadLoanApplications();
        this.notification.success('Loan approved successfully!')
      },
      error: (err) => {
        console.error(`${action} failed:`, err);

          const backendMsg = err?.error?.detail || 'Failed to perform action.';
          this.notification.info(backendMsg);
          this.router.navigate(['/member-dashboard'])
        // Show error to user
      }
    });
  }
}
