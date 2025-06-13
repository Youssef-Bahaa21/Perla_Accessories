import { Injectable, ComponentRef, ViewContainerRef, inject } from '@angular/core';
import { ConfirmationModalComponent, ConfirmationModalData } from '../../shared/components/confirmation-modal/confirmation-modal.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationModalService {
    private modalComponentRef?: ComponentRef<ConfirmationModalComponent>;
    private viewContainerRef?: ViewContainerRef;

    setViewContainerRef(vcr: ViewContainerRef): void {
        this.viewContainerRef = vcr;
        console.log('ViewContainerRef set for confirmation modal service');
    }

    async confirm(data: ConfirmationModalData): Promise<boolean> {
        console.log('ConfirmationModalService: confirm called with data:', data);

        if (!this.viewContainerRef) {
            // Fallback to browser confirm if no view container ref is set
            console.warn('ConfirmationModalService: No ViewContainerRef set, falling back to browser confirm');
            return confirm(`${data.title}\n\n${data.message}`);
        }

        // Clean up any existing modal
        this.destroy();

        // Create modal component
        this.modalComponentRef = this.viewContainerRef.createComponent(ConfirmationModalComponent);
        console.log('Modal component created:', this.modalComponentRef);

        try {
            // Show modal and wait for result
            const result = await this.modalComponentRef.instance.show(data);
            console.log('Modal resolved with result:', result);
            return result;
        } catch (error) {
            console.error('Error in modal:', error);
            return false;
        } finally {
            // Clean up immediately since we've already handled the promise resolution
            this.destroy();
        }
    }

    // Convenience methods for different types of confirmations
    async confirmDelete(itemName: string = 'this item'): Promise<boolean> {
        return this.confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger',
            icon: 'fa-solid fa-trash'
        });
    }

    async confirmAction(title: string, message: string, confirmText: string = 'Confirm'): Promise<boolean> {
        return this.confirm({
            title,
            message,
            confirmText,
            cancelText: 'Cancel',
            type: 'warning'
        });
    }

    async confirmLogout(): Promise<boolean> {
        return this.confirm({
            title: 'Confirm Logout',
            message: 'Are you sure you want to sign out? You will need to log in again to access your account.',
            confirmText: 'Sign Out',
            cancelText: 'Stay Logged In',
            type: 'info',
            icon: 'fa-solid fa-sign-out-alt'
        });
    }

    async confirmOrderCancel(): Promise<boolean> {
        return this.confirm({
            title: 'Cancel Order',
            message: 'Are you sure you want to cancel this order? This action cannot be undone.',
            confirmText: 'Cancel Order',
            cancelText: 'Keep Order',
            type: 'warning',
            icon: 'fa-solid fa-times-circle'
        });
    }

    async confirmPasswordReset(): Promise<boolean> {
        return this.confirm({
            title: 'Reset Password',
            message: 'Are you sure you want to reset your password? You will receive an email with further instructions.',
            confirmText: 'Send Reset Email',
            cancelText: 'Cancel',
            type: 'info',
            icon: 'fa-solid fa-key'
        });
    }

    private destroy(): void {
        if (this.modalComponentRef) {
            console.log('Destroying modal component');
            try {
                this.modalComponentRef.destroy();
            } catch (error) {
                console.error('Error destroying modal component:', error);
            } finally {
                this.modalComponentRef = undefined;
            }
        }
    }
} 