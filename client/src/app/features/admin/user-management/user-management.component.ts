import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../core/models';
import { ApiService } from '../../../core/services/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationModalService } from '../../../core/services/confirmation-modal.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];
    loading = false;
    error: string | null = null;
    editingUser: User | null = null;

    constructor(
        private api: ApiService,
        private notificationService: NotificationService,
        private confirmationService: ConfirmationModalService
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    async loadUsers(): Promise<void> {
        try {
            this.loading = true;
            this.error = null;
            const response = await this.api.users.list().toPromise();
            this.users = response || [];
        } catch (err) {
            this.error = 'Failed to load users';
            this.notificationService.show('Failed to load users', 'error');
        } finally {
            this.loading = false;
        }
    }

    async deleteUser(user: User): Promise<void> {
        if (user.role === 'admin') {
            this.notificationService.show('Cannot delete admin users', 'error');
            return;
        }

        const confirmed = await this.confirmationService.confirmDelete('this user');
        if (!confirmed) return;

        try {
            await this.api.users.delete(user.id).toPromise();
            this.notificationService.show('User deleted successfully');
            await this.loadUsers();
        } catch (err) {
            this.notificationService.show('Failed to delete user', 'error');
        }
    }

    async updateUser(user: User): Promise<void> {
        try {
            await this.api.users.update(user.id, user).toPromise();
            this.notificationService.show('User updated successfully');
            this.editingUser = null;
            await this.loadUsers();
        } catch (err) {
            this.notificationService.show('Failed to update user', 'error');
        }
    }

    startEditing(user: User): void {
        this.editingUser = { ...user };
    }

    cancelEditing(): void {
        this.editingUser = null;
    }

    isEditing(user: User): boolean {
        return this.editingUser?.id === user.id;
    }
} 