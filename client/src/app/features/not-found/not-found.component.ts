import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
    private router = inject(Router);

    ngOnInit(): void {
        // Component functionality without SEO - ready for later implementation
    }

    goHome(): void {
        this.router.navigate(['/']);
    }

    goToProducts(): void {
        this.router.navigate(['/products']);
    }

    goBack(): void {
        window.history.back();
    }
} 