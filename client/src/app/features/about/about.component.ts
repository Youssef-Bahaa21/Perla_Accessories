import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.component.html',
})
export class AboutComponent implements OnInit {
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.setupAboutSEO();
  }

  private setupAboutSEO(): void {
    this.seoService.updateSEO({
      title: 'About Perla - Premium Jewelry & Fashion Accessories Boutique',
      description: 'Learn about Perla Accessories - 3 years of crafting unique, limited-edition jewelry and fashion accessories. Discover our story, values, and commitment to exceptional quality.',
      keywords: 'about perla, jewelry boutique, premium accessories, handmade jewelry, Egyptian jewelry, fashion accessories, limited edition, boutique story',
      type: 'article'
    });

    // Add breadcrumb structured data
    const breadcrumbs = [
      { name: 'Home', url: 'https://perla-accessories.vercel.app' },
      { name: 'About', url: 'https://perla-accessories.vercel.app/about' }
    ];

    this.seoService.generateBreadcrumbs(breadcrumbs);
  }
}