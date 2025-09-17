import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { NotificationService } from '../../services/notification.service';




@Component({
  selector: 'app-member-profile',
  standalone: false,
  templateUrl: './member-profile.component.html',
  styleUrl: './member-profile.component.css'
})



export class MemberProfileComponent implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  profileImage: string | ArrayBuffer | null = null;
  churches: any[] = [];
  isSaving = false;
  isSavingPass = false;
  selectedFile: File | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private notification: NotificationService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      church: [''],
      phone: ['', [Validators.pattern(/^[0-9]{10,15}$/)]],
      email: ['', [Validators.email]],
      full_name: ['', Validators.required],
      date_of_birth: [''],
      occupation: [''],
    });


    this.passwordForm = this.fb.group({
      current_password: [''],
      new_password: [''],
      confirm_password: ['']
    });


  }





  ngOnInit(): void {
    this.loadProfileData();
    this.loadChurches();
  }

  loadProfileData(): void {
    this.isLoading = true;
    this.apiService.getProfile().subscribe({
      next: (profile) => {
        this.profileForm.patchValue({
          church: profile.church,
          phone: profile.phone,
          email: profile.email,
          full_name: profile.full_name,
          date_of_birth: profile.date_of_birth,
          occupation: profile.occupation
        });
        this.profileImage = profile.profile_picture || 'assets/images/default-profile.png';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
        this.errorMessage = 'Failed to load profile data';
        this.isLoading = false;
      }
    });
  }

  loadChurches(): void {
    this.apiService.getChurches().subscribe({
      next: (churches) => {
        this.churches = churches;
      },
      error: (err) => {
        console.error('Failed to load churches:', err);
        this.errorMessage = 'Failed to load church list';
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = new FormData();
    const formValues = this.profileForm.value;

    // Append all form values
    Object.keys(formValues).forEach(key => {
      if (formValues[key] !== null && formValues[key] !== undefined && formValues[key] !== '') {
        formData.append(key, formValues[key]);
      }
    });

    // Append profile picture if selected
    if (this.selectedFile) {
      formData.append('profile_picture', this.selectedFile);
    }

    this.apiService.updateProfile(formData).subscribe({
      next: (res) => {
        console.log('Profile updated:', res);
        this.successMessage = 'Profile updated successfully';
        this.isSaving = false;
        // Update local profile image if changed
        if (this.selectedFile && this.profileImage) {
          const profilePicUrl = URL.createObjectURL(this.selectedFile);
          this.profileImage = profilePicUrl;
        }
        this.selectedFile = null;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Update failed:', err);
        this.errorMessage = err.error?.message || 'Failed to update profile';
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.loadProfileData();
    this.selectedFile = null;
  }

  onPassSubmit(): void {
  if (this.passwordForm.invalid) return;

  this.isSavingPass = true;
  const payload = this.passwordForm.value;

  this.apiService.changePassword(payload).subscribe({
    next: (res) => {
      this.isSavingPass = false;
      this.notification.success(res.success)
      // alert('Password updated successfully! Please log in again.');
      this.passwordForm.reset();
      this.router.navigate(['/']);
    },
    error: (err) => {
      this.isSavingPass = false;
      console.error('Error:', err);
      this.errorMessage = err.error?.error || 'Failed to update password';
      this.passwordForm.reset();
    }
  });
}




}

