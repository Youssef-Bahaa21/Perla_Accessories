import { Component, inject, HostBinding, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmationModalData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'warning' | 'danger' | 'info' | 'success';
    icon?: string;
}

@Component({
    selector: 'app-confirmation-modal',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-modal.component.html',
    styleUrls: ['./confirmation-modal.component.scss']
})
export class ConfirmationModalComponent {
    isVisible = false;
    isProcessing = false;
    data: ConfirmationModalData = {
        title: '',
        message: '',
        type: 'info'
    };

    private resolveCallback?: (result: boolean) => void;
    private cdr = inject(ChangeDetectorRef);
    private ngZone = inject(NgZone);

    @HostBinding('class.modal-open') get modalOpen() {
        return this.isVisible;
    }

    show(modalData: ConfirmationModalData): Promise<boolean> {
        return this.ngZone.run(() => {
            this.data = { ...modalData };
            this.isVisible = true;
            this.isProcessing = false;

            console.log('Modal showing with data:', this.data);
            this.cdr.detectChanges();

            return new Promise<boolean>((resolve) => {
                this.resolveCallback = resolve;
                console.log('Promise created, waiting for user action...');
            });
        });
    }

    onConfirm(): void {
        this.ngZone.run(() => {
            if (this.isProcessing) {
                console.log('Already processing, ignoring confirm click');
                return;
            }

            console.log('Confirm button clicked');
            this.isProcessing = true;
            this.cdr.detectChanges();

            // Use immediate execution instead of setTimeout
            this.hide(true);
        });
    }

    onCancel(): void {
        this.ngZone.run(() => {
            if (this.isProcessing) {
                console.log('Already processing, ignoring cancel click');
                return;
            }

            console.log('Cancel button clicked');
            this.isProcessing = true;
            this.cdr.detectChanges();

            // Use immediate execution instead of setTimeout
            this.hide(false);
        });
    }

    onBackdropClick(event: Event): void {
        this.ngZone.run(() => {
            if (event.target === event.currentTarget && !this.isProcessing) {
                console.log('Backdrop clicked');
                this.onCancel();
            }
        });
    }

    private hide(result: boolean): void {
        console.log('Hiding modal with result:', result);

        this.isVisible = false;
        this.isProcessing = false;

        if (this.resolveCallback) {
            try {
                // Resolve the promise immediately
                const callback = this.resolveCallback;
                this.resolveCallback = undefined;

                console.log('Resolving promise with:', result);
                callback(result);
            } catch (error) {
                console.error('Error resolving promise:', error);
            }
        }

        this.cdr.detectChanges();
    }

    getIconContainerClass(): string {
        const baseClass = 'bg-gradient-to-r shadow-lg';
        switch (this.data.type) {
            case 'danger':
                return `${baseClass} from-red-500 to-red-600`;
            case 'warning':
                return `${baseClass} from-amber-500 to-orange-500`;
            case 'success':
                return `${baseClass} from-green-500 to-green-600`;
            case 'info':
            default:
                return `${baseClass} from-pink-500 to-pink-600`;
        }
    }

    getIconClass(): string {
        if (this.data.icon) {
            return this.data.icon;
        }

        switch (this.data.type) {
            case 'danger':
                return 'fa-solid fa-triangle-exclamation';
            case 'warning':
                return 'fa-solid fa-exclamation-circle';
            case 'success':
                return 'fa-solid fa-check-circle';
            case 'info':
            default:
                return 'fa-solid fa-question-circle';
        }
    }

    getConfirmButtonClass(): string {
        const baseClass = 'hover:shadow-xl';
        switch (this.data.type) {
            case 'danger':
                return `${baseClass} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500`;
            case 'warning':
                return `${baseClass} bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 focus:ring-amber-500`;
            case 'success':
                return `${baseClass} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-500`;
            case 'info':
            default:
                return `${baseClass} bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800 focus:ring-pink-500`;
        }
    }
} 