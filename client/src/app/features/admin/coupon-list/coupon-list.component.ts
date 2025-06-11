// src/app/features/admin/coupon-list/coupon-list.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api/api.service';
import { Coupon, CreateCouponDTO } from '../../../core/models';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-coupon-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.scss']
})
export class CouponListComponent implements OnInit {
  coupons: Coupon[] = [];
  usageCounts: Record<number, number> = {};
  editing: Coupon | null = null;
  form: CreateCouponDTO = this.defaultForm();
  loading = false;
  error = '';

  private api = inject(ApiService);

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.loading = true;
    this.api.coupons.list().subscribe({
      next: (list) => {
        this.coupons = list;
        this.loading = false;
        list.forEach(c => this.loadUsage(c.id));
      },
      error: () => {
        this.error = '⚠️ Failed to load coupons';
        this.loading = false;
      }
    });
  }

  loadUsage(couponId: number) {
    if (this.usageCounts[couponId] !== undefined) return;
    this.api.coupons.getUsage(couponId).subscribe({
      next: (res: any[]) => this.usageCounts[couponId] = res.length,
      error: () => this.usageCounts[couponId] = 0
    });
  }


  editCoupon(c: Coupon) {
    this.editing = c;
    this.form = { ...c };
  }

  cancelEdit() {
    this.editing = null;
    this.form = this.defaultForm();
    this.error = '';
  }

  saveCoupon() {
    this.error = '';

    const cleanedCode = this.form.code?.trim();
    if (!cleanedCode) {
      this.error = 'Code is required.';
      return;
    }

    this.form.code = cleanedCode;

    let request: Observable<any>;
    if (this.editing) {
      request = this.api.coupons.update(this.editing.id, this.form);
    } else {
      request = this.api.coupons.create(this.form);
    }

    request.subscribe({
      next: () => {
        this.cancelEdit();
        this.loadCoupons();
      },
      error: () => {
        this.error = '⚠️ Save failed – check if code is unique.';
      }
    });
  }

  deleteCoupon(id: number) {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    this.api.coupons.delete(id).subscribe({
      next: () => this.loadCoupons(),
      error: () => alert('⚠️ Delete failed')
    });
  }

  private defaultForm(): CreateCouponDTO {
    return {
      code: '',
      type: 'fixed',
      value: 0,
      min_order_amt: 0,
      expires_at: '',
      usage_limit: null,
      per_user_limit: 1,
      is_active: 1
    };
  }
}
