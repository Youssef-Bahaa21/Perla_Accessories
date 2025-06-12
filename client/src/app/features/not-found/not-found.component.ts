import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
    selector: 'app-not-found',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {
    private router = inject(Router);
    private seo = inject(SeoService);

    ngOnInit(): void {
        // Set SEO for 404 page
        const seoData = {
            title: 'Page Not Found - Perla Accessories',
            description: 'The page you are looking for could not be found. Browse our beautiful collection of handcrafted accessories and jewelry instead.',
            keywords: 'page not found, 404, perla accessories, jewelry, accessories',
            url: '/404',
            type: 'website' as const,
            structuredData: {
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: 'Page Not Found',
                description: 'Error 404 - Page not found'
            }
        };
        this.seo.updateSEO(seoData);
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