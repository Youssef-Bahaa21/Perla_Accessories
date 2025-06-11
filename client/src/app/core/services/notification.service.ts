// src/app/core/services/notification.service.ts
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    constructor(private toastr: ToastrService) { }

    show(message: string, type: 'success' | 'error' = 'success') {
        if (type === 'success') {
            this.toastr.success(message);
        } else if (type === 'error') {
            this.toastr.error(message, 'Error');
        }
    }
}
