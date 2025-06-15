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
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.setupPrivacySEO();
  }

  private setupPrivacySEO(): void {
    this.seoService.updateSEO({
      title: 'Privacy Policy - Perla Accessories | Data Protection & Customer Privacy',
      description: 'Read Perla Accessories privacy policy. Learn how we protect your personal information, handle customer data, and ensure your privacy when shopping with us.',
      keywords: 'privacy policy, data protection, customer privacy, personal information, perla accessories, shopping privacy',
      type: 'article'
    });

    const breadcrumbs = [
      { name: 'Home', url: 'https://perla-accessories.vercel.app' },
      { name: 'Privacy Policy', url: 'https://perla-accessories.vercel.app/privacy-policy' }
    ];

    this.seoService.generateBreadcrumbs(breadcrumbs);
  }
}
