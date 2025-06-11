import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
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
export class ForgotPasswordComponent implements OnInit {
  form: FormGroup;
  isSubmitting = false;
  success = '';
  error = '';
  shakeState = 'idle';
  formTouched = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private notify: NotificationService
  ) {
    this.form = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)
      ]]
    });
  }

  ngOnInit(): void {
    // Listen for form changes to trigger animations
    this.form.statusChanges.subscribe(() => {
      this.formTouched = true;
    });
  }

  triggerShakeAnimation(): void {
    this.shakeState = 'shaking';
    setTimeout(() => {
      this.shakeState = 'idle';
    }, 500);
  }

  submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.triggerShakeAnimation();
      return;
    }

    this.isSubmitting = true;
    this.error = '';
    this.success = '';

    const { email } = this.form.value;

    this.api.getCsrfToken().subscribe({
      next: () => {
        this.api.auth.forgotPassword(email).subscribe({
          next: (res) => {
            this.isSubmitting = false;
            this.success = res.message || 'Password reset link sent.';
            this.notify.show(this.success, 'success');
            this.form.reset();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.error = err?.error?.message || 'Failed to send reset email.';
            this.notify.show(this.error, 'error');
            this.triggerShakeAnimation();
          }
        });
      },
      error: () => {
        this.isSubmitting = false;
        this.error = 'Failed to get CSRF token';
        this.notify.show(this.error, 'error');
        this.triggerShakeAnimation();
      }
    });
  }
}
