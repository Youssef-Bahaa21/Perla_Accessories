import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.component.html',
  styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent implements OnInit {
  private seo = inject(SeoService);

  ngOnInit(): void {
    // Set SEO data for privacy policy page
    this.seo.updateSEO(this.seo.generatePrivacyPolicySEO());
    this.seo.updateCanonicalUrl('/privacy-policy');

    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Privacy Policy', url: '/privacy-policy' }
    ];
    const breadcrumbData = this.seo.generateBreadcrumbStructuredData(breadcrumbs);
    this.seo.updateSEO({ structuredData: breadcrumbData });
  }
}
