import { Component, inject } from '@angular/core';
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
    template: `
    <div 
      *ngIf="isVisible" 
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      (click)="onBackdropClick($event)"
    >
      <div 
        class="relative w-full max-w-md bg-white rounded-2xl shadow-2xl transform transition-all duration-300 scale-100 opacity-100"
        (click)="$event.stopPropagation()"
      >
        <!-- Header with Icon -->
        <div class="flex flex-col items-center p-6 pb-4">
          <div [ngClass]="getIconContainerClass()" class="w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <i [class]="getIconClass()" class="text-2xl text-white"></i>
          </div>
          
          <h3 class="text-xl font-bold text-gray-900 text-center mb-2">
            {{ data.title }}
          </h3>
          
          <p class="text-gray-600 text-center leading-relaxed">
            {{ data.message }}
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 p-6 pt-2">
          <button
            (click)="onCancel()"
            class="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {{ data.cancelText || 'Cancel' }}
          </button>
          
          <button
            (click)="onConfirm()"
            [ngClass]="getConfirmButtonClass()"
            class="flex-1 px-4 py-3 text-white rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {{ data.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  `,
    styles: [`
    :host {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1000;
      pointer-events: none;
    }

    :host(.visible) {
      pointer-events: auto;
    }

    .modal-enter {
      animation: modalEnter 0.3s ease-out;
    }

    .modal-leave {
      animation: modalLeave 0.2s ease-in;
    }

    @keyframes modalEnter {
      from {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
      to {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }

    @keyframes modalLeave {
      from {
        opacity: 1;
        transform: scale(1) translateY(0);
      }
      to {
        opacity: 0;
        transform: scale(0.9) translateY(-20px);
      }
    }
  `]
})
export class ConfirmationModalComponent {
    isVisible = false;
    data: ConfirmationModalData = {
        title: '',
        message: '',
        type: 'info'
    };

    private resolveCallback?: (result: boolean) => void;

    show(modalData: ConfirmationModalData): Promise<boolean> {
        this.data = { ...modalData };
        this.isVisible = true;

        return new Promise<boolean>((resolve) => {
            this.resolveCallback = resolve;
        });
    }

    onConfirm(): void {
        this.hide(true);
    }

    onCancel(): void {
        this.hide(false);
    }

    onBackdropClick(event: Event): void {
        if (event.target === event.currentTarget) {
            this.onCancel();
        }
    }

    private hide(result: boolean): void {
        this.isVisible = false;
        if (this.resolveCallback) {
            this.resolveCallback(result);
            this.resolveCallback = undefined;
        }
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
                return `${baseClass} bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800`;
            case 'warning':
                return `${baseClass} bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700`;
            case 'success':
                return `${baseClass} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800`;
            case 'info':
            default:
                return `${baseClass} bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800`;
        }
    }
} 