// password.validator.ts
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class PasswordValidator {
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const errors: any = {};
    
    if (!/[A-Z]/.test(value)) {
      errors.missingUpperCase = 'Must contain at least one uppercase letter';
    }
    
    if (!/[a-z]/.test(value)) {
      errors.missingLowerCase = 'Must contain at least one lowercase letter';
    }
    
    if (!/[0-9]/.test(value)) {
      errors.missingNumber = 'Must contain at least one number';
    }
    
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.missingSpecialChar = 'Must contain at least one special character';
    }

    return Object.keys(errors).length ? { strongPassword: errors } : null;
  }

  static matchPassword(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { 
      mismatch: 'Passwords do not match' 
    };
  }
}