import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NotificationService } from '../../../core/services/notification.service';
import { ApiService } from '../../../core/services/api/api.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
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
export class ResetPasswordComponent implements OnInit {
  form!: FormGroup;
  token = '';
  error = '';
  success = '';
  isSubmitting = false;
  shakeState = 'idle';
  formTouched = false;
  tokenValid = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private api: ApiService,
    private router: Router,
    private notify: NotificationService
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    // If no token is provided, redirect to forgot password
    if (!this.token) {
      this.router.navigate(['/forgot-password']);
      this.notify.show('Missing reset token. Please request a new password reset link.', 'error');
      return;
    }

    this.form = this.fb.group(
      {
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirm: ['', Validators.required],
      },
      { validators: this.passwordsMatchValidator }
    );

    // Listen for form changes to trigger animations
    this.form.statusChanges.subscribe(() => {
      this.formTouched = true;
    });
  }

  private passwordsMatchValidator(ctrl: AbstractControl) {
    const pwd = ctrl.get('password')?.value;
    const confirm = ctrl.get('confirm')?.value;
    return pwd === confirm ? null : { mismatch: true };
  }

  triggerShakeAnimation(): void {
    this.shakeState = 'shaking';
    setTimeout(() => {
      this.shakeState = 'idle';
    }, 500);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    const { password } = this.form.value;

    this.api.getCsrfToken().subscribe({
      next: () => {
        this.api.auth.resetPassword(this.token, password).subscribe({
          next: (res) => {
            this.success = res.message;
            this.notify.show(this.success, 'success');
            this.isSubmitting = false;
            setTimeout(() => this.router.navigate(['/login']), 2000);
          },
          error: (err) => {
            this.error = err?.error?.message || 'Reset failed. The link may have expired. Please request a new one.';
            this.notify.show(this.error, 'error');
            this.isSubmitting = false;
            this.triggerShakeAnimation();

            // If token is invalid/expired, redirect after 3 seconds
            if (err?.error?.message?.includes('Invalid or expired')) {
              this.tokenValid = false;
              setTimeout(() => this.router.navigate(['/forgot-password']), 3000);
            }
          },
        });
      },
      error: () => {
        this.error = 'Failed to get CSRF token';
        this.notify.show(this.error, 'error');
        this.isSubmitting = false;
        this.triggerShakeAnimation();
      },
    });
  }
}
