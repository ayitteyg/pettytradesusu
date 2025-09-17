import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { PasswordValidator } from '../../password.validator';
import { NotificationService } from '../../services/notification.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})


export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  isLoading = false;
  isSubmitted = false;
  showPassword = false;
  showConfirmPassword = false;
  subscription=false

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private notification: NotificationService,
    private http:HttpClient
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }



  initializeForm(): void {
  this.signupForm = this.formBuilder.group({
    first_name: ['', [Validators.required,]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    email: ['', [Validators.required, Validators.email]],
    password1: ['', [
      // Validators.required,
      // Validators.minLength(8),
      // PasswordValidator.strongPassword
    ]],
    password2: ['', 
      // Validators.required
    ]
  }, { validators: PasswordValidator.matchPassword });
}


  get f() { return this.signupForm?.controls; }

 
 
// ✅ Improved onSubmit
// signup.component.ts

onSubmit(): void {
  if (this.signupForm.invalid) {
    this.markFormGroupTouched(this.signupForm);
    return;
  }

  this.isSubmitted = true;
  this.isLoading = true;

  console.log('preparing to hit endpoint')

  const sub = this.authService.signup(this.signupForm.value).subscribe({
    next: () => {
      this.isLoading = false; // Reset loading state

      console.log('signup is working')

      this.notification.success('Registration successful!');
      this.router.navigate(['/landing']);
    },
    error: (error) => {
      this.isLoading = false; // Reset loading state on error
      const msg = error.error?.message || 'An error occurred';
      this.notification.error(msg);
      // this.handleSubmissionError(error);
    },
    complete: () => {
      this.isLoading = false; // Additional safety
    }
  });

  
}




  togglePasswordVisibility(field: 'password1' | 'password2'): void {
    if (field === 'password1') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getPasswordStrengthClass(): string {
    if (!this.f['password']?.value) return '';
    
    const value = this.f['password'].value;
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const strength = 
      (value.length >= 8 ? 1 : 0) +
      (hasUpperCase ? 1 : 0) +
      (hasLowerCase ? 1 : 0) +
      (hasNumber ? 1 : 0) +
      (hasSpecialChar ? 1 : 0);
    
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrengthClass();
    switch (strength) {
      case 'weak': return 'Weak password';
      case 'medium': return 'Medium strength';
      case 'strong': return 'Strong password';
      default: return '';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }



  getPasswordErrors(): string[] {
  const passwordErrors = this.signupForm.get('password')?.errors?.['strongPassword'];
  if (!passwordErrors) return [];
  
  return Object.values(passwordErrors);
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