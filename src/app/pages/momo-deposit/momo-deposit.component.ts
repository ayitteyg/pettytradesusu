import { Component, OnInit} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-momo-deposit',
  standalone: false,
  templateUrl: './momo-deposit.component.html',
  styleUrl: './momo-deposit.component.css'
})



export class MomoDepositComponent{
  currentStep: number = 1;
  paymentSuccess: boolean = false;
  paymentError: boolean = false;


  depositForm: FormGroup;
  processingPayment = false;
  showPaymentModal = false;
  paymentStatus: 'pending' | 'success' | 'failed' = 'pending';
  paymentReference: string | null = null;
  
  networks = [
    { id: 'mtn', name: 'MTN', logo: 'images/mtn-logo.jpg' },
    { id: 'telecel', name: 'Telecel', logo: 'images/telecel-logo.jpg' },
    { id: 'airteltigo', name: 'AirtelTigo', logo: 'images/airteltigo-logo.png' }
  ];
  
  constructor(
    private route: ActivatedRoute,   
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private notification: NotificationService,
    private http: HttpClient,
    private router: Router,
 
  ) {
    this.depositForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(5), Validators.max(5000)]],
      network: ['mtn', Validators.required],
      phoneNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{9}$/)]],
      
    });
  }

  get fee() {
    const amount = this.depositForm.value.amount || 0;
    return Math.max(0.5, amount * 0.015).toFixed(2); // 1.5% or min 0.5 GHS
  }

  get total() {
    const amount = this.depositForm.value.amount || 0;
    return (parseFloat(amount.toString()) + parseFloat(this.fee)).toFixed(2);
  }

   
  initiatePayment() {
    if (this.depositForm.invalid) return;

    this.processingPayment = true;
    this.showPaymentModal = true;
    this.paymentStatus = 'pending';

    const paymentData = {
      amount: this.total,
      network: this.depositForm.value.network,
      phone_number: this.depositForm.value.phoneNumber,
    };

    this.apiService.initiateMomoPayment(paymentData).subscribe({
      
      next: (response) => {

         console.log(response)
          this.currentStep = 2;
          this.processingPayment = true;
        //  console.log(response.data)
        if (response.status === 'success' && response.reference   && response.authorization_url) {

          console.log(response.status)
          // window.location.href = response.authorization_url;

        // Open a new window for checkout
        const win = window.open(response.authorization_url, '_blank', 'width=500,height=600');

        if (!win) {
          // Handle case where popup is blocked
          alert('Please allow popups for this site to complete payment');
          this.processingPayment = false;
          return;
        }

        // Set up polling to check both window closure and payment status
        const pollInterval = setInterval(() => {
          // Check if window was closed by user
          if (win.closed) {
            clearInterval(pollInterval);
            this.paymentReference = response.reference;
            this.pollPaymentStatus(response.reference);
            this.processingPayment = false;
            return;
          }

          // Optional: Also check if payment was completed without window closure
          // You might want to add additional checks here
        }, 30000);

        // Set timeout to automatically close after some time (safety measure)
        const timeout = setTimeout(() => {
          if (!win.closed) {
            win.close(); // Safely close the window
            clearInterval(pollInterval);
            this.processingPayment = false;
            // Optionally notify user
            // alert('Payment window timed out. Please try again.');
            this.notification.info("Payment window timed out. Please try again")
          }
        }, 10000); // 5 minutes timeout

    
        } else {
          this.notification.error("fail to complete payment")
           this.processingPayment = false;
        }
      },
      error: (err) => {
        this.handlePaymentError(err.message || 'Payment initiation failed');
         this.processingPayment = false;
      }
    });
  }

  
  pollPaymentStatus(reference: string) {
    const interval = setInterval(() => {
      if (!reference) {
        clearInterval(interval);
        this.handlePaymentError('Invalid payment reference');
        return;
      }

      this.apiService.verifyPayment(reference).subscribe({
        next: (response) => {
          if (response.status === 'success') {
            clearInterval(interval);
            this.paymentStatus = 'success';
            this.processingPayment = false;
            this.currentStep = 3;
            this.paymentSuccess = true;
            this.notification.success('payment successful')
            this.depositForm.reset()
            this.router.navigate(['/loader']);

          } else if (response.status === 'failed') {
            clearInterval(interval);
            this.processingPayment = false;
            this.paymentError = true;
            this.handlePaymentError(response.message || 'Payment failed');
          }
        },
        error: (err) => {
          clearInterval(interval);
          this.handlePaymentError(err.message || 'Verification failed');
        }
      });
    }, 2000);
  }

  handlePaymentError(message: string) {
    this.paymentStatus = 'failed';
    this.processingPayment = false;
    // Show error message to user
    console.error('Payment error:', message);
    this.notification.error(message)
  }


 goToStep(step: number) {
    if (step < this.currentStep) {
      // Allow going back to previous steps
      this.currentStep = step;
      this.paymentSuccess = false;
      this.paymentError = false;
    }
  }


}
function ngOnInit() {
  throw new Error('Function not implemented.');
}

