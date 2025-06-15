import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Review } from '../../../core/models';
import { ApiService } from '../../../core/services/api/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmationModalService } from '../../../core/services/confirmation-modal.service';

@Component({
    selector: 'app-review-management',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './review-management.component.html',
    styleUrls: ['./review-management.component.scss']
})
export class ReviewManagementComponent implements OnInit {
    reviews: Review[] = [];
    loading = false;
    error: string | null = null;

    constructor(
        private api: ApiService,
        private notificationService: NotificationService,
        private confirmationService: ConfirmationModalService
    ) { }

    ngOnInit(): void {
        this.loadReviews();
    }

    async loadReviews(): Promise<void> {
        try {
            this.loading = true;
            this.error = null;
            const response = await this.api.reviews.list().toPromise();
            this.reviews = response || [];
        } catch (err) {
            console.error('Failed to load reviews:', err);
            this.error = 'Failed to load reviews';
            this.notificationService.show('Failed to load reviews', 'error');
        } finally {
            this.loading = false;
        }
    }

    async deleteReview(review: Review): Promise<void> {
        const confirmed = await this.confirmationService.confirmDelete('this review');
        if (!confirmed) return;

        try {
            await this.api.reviews.delete(review.id).toPromise();
            this.notificationService.show('Review deleted successfully');
            await this.loadReviews();
        } catch (err) {
            console.error('Failed to delete review:', err);
            this.notificationService.show('Failed to delete review', 'error');
        }
    }

    async updateReview(review: Review): Promise<void> {
        try {
            await this.api.reviews.update(review.id, review).toPromise();
            this.notificationService.show('Review updated successfully');
            await this.loadReviews();
        } catch (err) {
            this.notificationService.show('Failed to update review', 'error');
        }
    }
} 