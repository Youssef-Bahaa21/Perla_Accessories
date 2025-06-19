import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth/auth.service';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(10px)'
      })),
      transition('void <=> *', animate('300ms ease-in-out')),
    ]),
    trigger('shake', [
      state('idle', style({ transform: 'translateX(0)' })),
      state('shaking', style({ transform: 'translateX(0)' })),
      transition('idle => shaking', [
        style({ transform: 'translateX(0)' }),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(-10px)' })),
        animate('100ms', style({ transform: 'translateX(10px)' })),
        animate('100ms', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class RegisterComponent implements OnInit {
  form: FormGroup;
  error = '';
  isSubmitting = false;
  showPassword = false;
  showConfirmPassword = false;
  shakeState = 'idle';
  formTouched = false;
  success = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private notify: NotificationService,
  ) {
    this.form = this.fb.group(
      {
        email: ['', [
          Validators.required,
          Validators.email,
          Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
        ]],
        password: ['', [
          Validators.required,
          Validators.minLength(8),
          this.createPasswordStrengthValidator()
        ]],
        confirm: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator },
    );
  }

  ngOnInit(): void {
    // Listen for form changes to trigger animations
    this.form.statusChanges.subscribe(() => {
      this.formTouched = true;
    });
  }

  private passwordsMatchValidator(ctrl: AbstractControl) {
    const pwd = ctrl.get('password')?.value;
    const cfm = ctrl.get('confirm')?.value;
    return pwd === cfm ? null : { mismatch: true };
  }

  private createPasswordStrengthValidator() {
    return (control: AbstractControl) => {
      const value = control.value;
      if (!value) {
        return null;
      }

      const hasUpperCase = /[A-Z]+/.test(value);
      const hasLowerCase = /[a-z]+/.test(value);
      const hasNumeric = /[0-9]+/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  getEmailErrorMessage(): string {
    const emailControl = this.form.get('email');
    if (emailControl?.hasError('required')) {
      return 'Email is required';
    }
    if (emailControl?.hasError('email') || emailControl?.hasError('pattern')) {
      return 'Please enter a valid email address';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    const passwordControl = this.form.get('password');
    if (passwordControl?.hasError('required')) {
      return 'Password is required';
    }
    if (passwordControl?.hasError('minlength')) {
      return 'Password must be at least 8 characters long';
    }
    if (passwordControl?.hasError('passwordStrength')) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const confirmControl = this.form.get('confirm');
    if (confirmControl?.hasError('required')) {
      return 'Please confirm your password';
    }
    if (this.form.hasError('mismatch')) {
      return 'Passwords do not match';
    }
    return '';
  }

  triggerShakeAnimation(): void {
    this.shakeState = 'shaking';
    setTimeout(() => {
      this.shakeState = 'idle';
    }, 500);
  }

  submit() {
    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });

      // Trigger shake animation for invalid form
      this.triggerShakeAnimation();
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    const { email, password } = this.form.value;

    this.auth.register(email, password).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        // Use the message from the API if available
        this.success = response.message || 'Registration successful! Please log in to continue.';
        this.notify.show(this.success, 'success');
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: (err: any) => {
        this.isSubmitting = false;

        // Handle rate limit errors (429)
        if (err?.status === 429) {
          const errorData = err?.error;
          if (errorData?.error && errorData?.retryAfter) {
            this.error = `${errorData.error} Try again in ${errorData.retryAfter}.`;
          } else {
            this.error = 'Too many account creation attempts. Please try again later.';
          }
        }
        // Handle validation errors (400)
        else if (err?.status === 400) {
          if (err?.error?.message === 'Validation failed') {
            this.error = 'Your registration details could not be validated. Please check your email format and password requirements.';

            // Check for specific validation errors
            if (err?.error?.errors) {
              const errors = err.error.errors;
              if (errors.email) {
                this.form.get('email')?.setErrors({ serverError: true });
                this.error = `Email validation failed: ${errors.email}`;
              }
              if (errors.password) {
                this.form.get('password')?.setErrors({ serverError: true });
                this.error = `Password validation failed: ${errors.password}`;
              }
            }
          } else {
            this.error = err?.error?.message || 'Registration validation failed';
          }
        } else {
          this.error = err?.error?.message || 'Registration failed';
        }

        this.triggerShakeAnimation();
      },
    });
  }
}
