// src/app/features/products/review-form/review-form.component.ts

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { ApiService } from '../../../../core/services/api/api.service';
import { AuthService } from '../../../../core/services/auth/auth.service';

@Component({
  selector: 'app-review-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-form.component.html',
})
export class ReviewFormComponent {
  @Input() productId!: number;
  @Output() submitted = new EventEmitter<void>();

  form: FormGroup;
  error = '';
  loading = false;

  constructor(
    private fb: FormBuilder,
    private api: ApiService,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', Validators.required]
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';

    // Check if user is logged in using AuthService
    const currentUser = this.auth.currentUser$.value;
    if (!currentUser) {
      this.error = 'You must be logged in to post a review.';
      this.loading = false;
      return;
    }

    const { rating, comment } = this.form.value;
    this.api.reviews.create({
      product_id: this.productId,
      user_id: currentUser.id,
      rating,
      comment
    }).subscribe({
      next: () => {
        this.form.reset({ rating: 5, comment: '' });
        this.loading = false;
        this.submitted.emit();  // tell parent to refresh
      },
      error: err => {
        console.error('Review failed', err);
        this.error = 'Could not submit review.';
        this.loading = false;
      }
    });
  }
}
