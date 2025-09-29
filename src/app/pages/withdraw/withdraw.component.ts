import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-withdraw',
  standalone: false,
  templateUrl: './withdraw.component.html',
  styleUrl: './withdraw.component.css'
})


export class WithdrawComponent {
  withdrawForm: FormGroup;
  showConfirmationModal = false;
  loading:boolean = false
  isProcessing = false;
    activeLoan: any = null;
  // Dummy data - replace with actual API data
  currentBalance: number = 0;
  is_currentBalance_zero:boolean = true
  upcomingLoanDeduction: number = 0;
  availableBalance: number = 0;
  maxWithdrawalAmount = this.availableBalance * 0.8; // 80% of available balance

  constructor(
    private fb: FormBuilder,
    private apiservice:ApiService,
    private notification: NotificationService,
    private router: Router,

  ) {
    this.withdrawForm = this.fb.group({
      amount: ['', [
        Validators.required,
        // Validators.min(1),
        // Validators.max(this.maxWithdrawalAmountToWithdrwal)
      ]]
    });
  }

  get amount() {
    return this.withdrawForm.get('amount');
  }


  get availableBalancetoWithdrawl(): number {
  return (this.currentBalance || 0) - (this.upcomingLoanDeduction || 0);
}

 get maxWithdrawalAmountToWithdrwal(): number {
  return (this.availableBalancetoWithdrawl * 0.8 || 0);
}


  ngOnInit(): void {
   
   
   this.loadCurrentBalance()


   this.apiservice.getLoanSummary().subscribe({
    
      next: (data) => {
        this.loading = true
        console.log(data)
        this.activeLoan = data.activeLoan;
        this.upcomingLoanDeduction = this.activeLoan.nextPayment.amount || 0
        this.loading = false
      },
      error: (err) => {
        console.error('Failed to fetch loan summary:', err);
      }
    });

    
  }



  loadCurrentBalance(): void {
     this.loading = true
    this.apiservice.getDashboardData().subscribe({
      next: (res: any) => {
        const summary = res.data.summary || {};
        this.currentBalance = summary.current_balance || 0;
        this.is_currentBalance_zero = this.currentBalance <= 0;

        console.log("summary-withdrawal: ", summary);
        this.loading = false
      },
      error: (err: any) => {
        console.error("Failed to fetch balance:", err);
        this.currentBalance = 0;
        this.is_currentBalance_zero = true;
      }
    });
  }



  onSubmit() {
    if (this.withdrawForm.invalid) {
      this.withdrawForm.markAllAsTouched();
      return;
    }

    this.showConfirmationModal = true;
  }

 

  confirmWithdrawal() {
    this.isProcessing = true;

    const formattedDate = this.formatDate(new Date()); // Format it here

    const payload = {
    amount: this.withdrawForm.value.amount,
    date: formattedDate,
    member: localStorage.getItem('userId'),
    transaction_type: 'withdrawal',
    reference: 'withdrawals',
    note: 'withdrawals for saving Savings account',

  };
    
    // Simulate API call
    const amount = this.withdrawForm.get('amount');


    if(this.withdrawForm.value.amount > this.maxWithdrawalAmountToWithdrwal){
      this.notification.warning("Withdrawal exceed available amount")
      this.isProcessing = false;
        this.showConfirmationModal = false;

    }else{
         this.apiservice.submitTransaction(payload).subscribe({
      next:()=>{
        this.notification.info("Withdrawal request received, Momo Wallet will be credit Shortly")
        this.withdrawForm.reset()
        this.isProcessing = false;
        this.showConfirmationModal = false;
        this.router.navigate(['/loader']);
      },
       error: (err) => {
        const errorMsg = err?.error?.loan || err?.error?.detail || 'Withdrawal request failed';
        this.notification.error(errorMsg);
        this.isProcessing = false;
        this.showConfirmationModal = false;
      }

    })
    }


 
    // setTimeout(() => {
    //   console.log('Withdrawal payload:', {
    //     amount: this.withdrawForm.value.amount,
    //     timestamp: new Date().toISOString()
    //   });
      
    //   this.isProcessing = false;
    //   this.showConfirmationModal = false;
    //   this.withdrawForm.reset();
      
    //   // Show success message (you can add toast notification here)
    //   alert('Withdrawal request submitted successfully!');
    //   this.notification.info("Withdrawal request received, Momo Wallet will be credit Shortly")
    // }, 2000);
  }

  cancelWithdrawal() {
    this.showConfirmationModal = false;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount);
  }


  formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


}
