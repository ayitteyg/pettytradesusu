import { Component, OnInit,  ElementRef, EventEmitter, HostListener, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Offcanvas } from 'bootstrap';
import { NotificationService } from '../../services/notification.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApiService } from '../../services/api.service';



@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})


export class LoginComponent implements OnInit  {
  loginForm: FormGroup;
  isSubmitted = false;
  errorMessage = '';
  // Add this property
  isLoading: boolean = false;
  currentTime: string = '';
  uuid:string = "";

  

  //typing effect
  appNameText: string = 'WELCOME TO PETTY TRADERS SUSU';
  displayAppNameText: string = '';
  currentIndex: number = 0;
  intervalId: any;


   

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notification: NotificationService,
    private http: HttpClient, 
    private apiservice: ApiService,
  ) 
  

  
  {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(4)]] //update password minlenght
    });
  }

    ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000); // Update every second
    this.startTyping();

    


  }


  
 
  
  ngAfterViewInit() {
    const offcanvasEl = document.getElementById('readmoreCanvas');
    if (offcanvasEl) {
      new Offcanvas(offcanvasEl); // Initializes the offcanvas (optional)
    }
  }
  // Getter for easy access to form fields
  get formControls() {
    return this.loginForm.controls;
  }





onSubmitForm() {
this.isSubmitted = true
if (this.loginForm.invalid) {
  console.log("form invalid")
}

  if (this.loginForm.valid) {
    this.isLoading = true
    const { username, password } = this.loginForm.value;

  
    this.authService.login(username, password).subscribe({
      next: res => {
        console.log('Logged in:', res);
        this.router.navigate(['/loader']);
        this.notification.success("Welcome Back")
        this.isLoading = false
      },
      error: err => {
        console.error('Login failed:', err);
        // this.handleSubmissionError
        this.notification.info("Credentials Unauthorized")
        this.isLoading = false
      }
    });
  }
}


updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }


   startTyping() {
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.appNameText.length) {
        this.displayAppNameText += this.appNameText[this.currentIndex];
        this.currentIndex++;
      } else {
        clearInterval(this.intervalId); // Stop when complete
      }
    }, 80); // Speed: 150ms per letter, you can adjust this
  }



    private handleSubmissionError(error: any): void {
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.status === 400) {
      if (error.error) {
        // Handle specific validation errors from server
        if (error.error.username) {
          errorMessage = `Username error: ${error.error.username.join(' ')}`;
        } else if (error.error.email) {
          errorMessage = `Email error: ${error.error.email.join(' ')}`;
        } else if (error.error.password) {
          errorMessage = `Password error: ${error.error.password.join(' ')}`;
        }
      }
    } else if (error.status === 0) {
      errorMessage = 'Network error. Please check your connection.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    this.notification.error(errorMessage);
    console.error('Registration error:', error);
  }

}
