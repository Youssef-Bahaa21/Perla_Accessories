// src/app/features/admin/admin-layout/admin-layout.component.ts
import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReviewManagementComponent } from '../review-management/review-management.component';
import { UserManagementComponent } from '../user-management/user-management.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    ReviewManagementComponent,
    UserManagementComponent
  ],
  templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent { }
