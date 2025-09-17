import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, Validators  } from '@angular/forms';
import { ConfirmDialogComponent } from '../../component/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '../../services/notification.service';




@Component({
  selector: 'app-add-transaction',
  standalone: false,
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.css'
})
export class AddTransactionComponent {



 form: FormGroup;
  members: any[] = [];
  filteredMembers: any[] = [];
  loading = false;
  selectedMemberName = '';

  constructor(
    private fb: FormBuilder,
    private apiservice: ApiService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {
    this.form = this.fb.group({
      member: ['', Validators.required],
      transaction_type: ['', Validators.required],
      date: ['', Validators.required], // [new Date()],  // default to today
      amount: ['', [Validators.required, Validators.min(1)]],
      notes: ['']
    });
  }

  ngOnInit() {
    this.apiservice.getAllMembers().subscribe(data => {
      this.members = data;
    });
  }

  onMemberInput(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredMembers = this.members.filter(m =>
      m.username.toLowerCase().includes(query)
    );
  }

    onSelectMember(member: any) {
      this.form.patchValue({ member: member.id });
      this.selectedMemberName = member.username;
      this.filteredMembers = [];
}


  onSubmit() {

  const rawForm = this.form.value;

  const formattedDate = this.formatDate(rawForm.date); // Format it here

  const payload = {
    ...rawForm,
    date: formattedDate,
  };


    if (this.form.invalid) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Confirm Submission',
        message: 'Do you want to submit this transaction?',
      }
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.loading = true;
        this.apiservice.submitTransaction(payload).subscribe({
          next: () => {
            this.loading = false;
            console.log(payload)
            this.notification.success('Transaction recorded')



           //if transaction type is loan repayment, aftersaving log into loan repayment table
            const member = this.form.get('member')?.value;
            const transactionType = this.form.get('transaction_type')?.value;
            const amount = this.form.get('amount')?.value;
            console.log(member, transactionType, amount);


             if (transactionType === 'loan_repayment') {
                const repaymentData = {
                  member: member,        // required if account officer; can be omitted if backend defaults to logged-in user
                  amount_paid: amount
                };

                this.apiservice.addLoanRepayment(repaymentData).subscribe({
                  next: () => {
                    this.notification.success('Loan repayment logged');
                    this.form.reset();
                  },
                  error: (err) => {
                    const errorMsg = err?.error?.loan || err?.error?.detail || 'Failed to logged repayment';
                    this.notification.error(errorMsg);
                  }
                });
              } 
              

          this.form.reset();

          },
          error: () => {
            this.loading = false;
            this.notification.error('Failed to record transaction.')
          }
        });
      }
    });
  }



  formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // month is 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

}
