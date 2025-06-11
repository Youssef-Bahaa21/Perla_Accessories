import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
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
    trigger('pulse', [
      state('normal', style({ transform: 'scale(1)' })),
      state('pulsing', style({ transform: 'scale(1)' })),
      transition('normal => pulsing', [
        animate('400ms ease-in', style({ transform: 'scale(1.03)' })),
        animate('400ms ease-out', style({ transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class LoginComponent implements OnInit {
  form: FormGroup;
  error = '';
  isSubmitting = false;
  showPassword = false;
  loginAttempts = 0;
  isLocked = false;
  lockTime: number | null = null;
  shakeState = 'idle';
  pulseState = 'normal';
  formTouched = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
    });
  }

  ngOnInit(): void {
    // Only access localStorage in the browser
    if (isPlatformBrowser(this.platformId)) {
      // Check if there's a stored lock time
      const storedLockData = localStorage.getItem('loginLock');
      if (storedLockData) {
        const lockData = JSON.parse(storedLockData);
        const now = new Date().getTime();

        if (now < lockData.expires) {
          this.isLocked = true;
          this.lockTime = Math.ceil((lockData.expires - now) / 60000); // minutes
          this.startLockCountdown();
          this.startPulseAnimation();
        } else {
          // Lock expired, clear it
          localStorage.removeItem('loginLock');
        }
      }

      // Check stored login attempts
      const storedAttempts = localStorage.getItem('loginAttempts');
      if (storedAttempts) {
        this.loginAttempts = parseInt(storedAttempts, 10);
      }
    }

    // Listen for form changes to trigger animations
    this.form.statusChanges.subscribe(() => {
      this.formTouched = true;
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
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
    return '';
  }

  triggerShakeAnimation(): void {
    this.shakeState = 'shaking';
    setTimeout(() => {
      this.shakeState = 'idle';
    }, 500);
  }

  startPulseAnimation(): void {
    if (this.isLocked) {
      this.pulseState = 'pulsing';
      setTimeout(() => {
        this.pulseState = 'normal';
        this.startPulseAnimation();
      }, 1000);
    }
  }

  private startLockCountdown(): void {
    if (this.lockTime && this.lockTime > 0) {
      setTimeout(() => {
        if (this.lockTime) {
          this.lockTime--;
          if (this.lockTime > 0) {
            this.startLockCountdown();
          } else {
            this.isLocked = false;
            if (isPlatformBrowser(this.platformId)) {
              localStorage.removeItem('loginLock');
              localStorage.removeItem('loginAttempts');
            }
            this.loginAttempts = 0;
          }
        }
      }, 60000); // Update every minute
    }
  }

  private lockAccount(): void {
    this.isLocked = true;
    this.lockTime = 15; // 15 minutes

    // Store lock information
    const lockExpires = new Date().getTime() + (15 * 60 * 1000);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('loginLock', JSON.stringify({
        expires: lockExpires
      }));
    }

    this.startLockCountdown();
    this.startPulseAnimation();
  }

  submit() {
    if (this.isLocked) {
      this.error = `Account is temporarily locked. Please try again in ${this.lockTime} minutes.`;
      this.triggerShakeAnimation();
      return;
    }

    if (this.form.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        control?.markAsTouched();
      });
      this.triggerShakeAnimation();
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    const { email, password } = this.form.value;

    this.auth.login(email!, password!).subscribe({
      next: ({ user }) => {
        this.isSubmitting = false;
        // Reset login attempts on successful login
        this.loginAttempts = 0;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.removeItem('loginAttempts');
        }

        const target = user.role === 'admin' ? '/admin' : '/products';
        this.router.navigateByUrl(target);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.error = err?.error?.message || 'Login failed';
        this.triggerShakeAnimation();

        // Increment login attempts
        this.loginAttempts++;
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('loginAttempts', this.loginAttempts.toString());
        }

        // Lock account after 5 failed attempts
        if (this.loginAttempts >= 5) {
          this.lockAccount();
          this.error = `Too many failed login attempts. Account is locked for ${this.lockTime} minutes.`;
        }
      },
    });
  }
}
