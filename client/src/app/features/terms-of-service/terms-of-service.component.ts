import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-of-service.component.html',
  styleUrl: './terms-of-service.component.scss'
})
export class TermsOfServiceComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    // Set SEO data for terms of service page
    this.seo.updateSEO(this.seo.generateTermsOfServiceSEO());
    this.seo.updateCanonicalUrl('/terms-of-service');

    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Terms of Service', url: '/terms-of-service' }
    ];
    const breadcrumbData = this.seo.generateBreadcrumbStructuredData(breadcrumbs);
    this.seo.updateSEO({ structuredData: breadcrumbData });
  }
}
