import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { ApiService } from './api/api.service';
import { Product, Category } from '../models';

export interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SitemapService {
    private api = inject(ApiService);
    private readonly baseUrl = 'https://perla-accessories.vercel.app';
    private readonly staticPages: SitemapUrl[] = [
        {
            loc: '',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: 1.0
        },
        {
            loc: '/about',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.8
        },
        {
            loc: '/products',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'daily',
            priority: 0.9
        },
        {
            loc: '/privacy-policy',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: 0.3
        },
        {
            loc: '/terms-of-service',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'yearly',
            priority: 0.3
        },
        {
            loc: '/returns-policy',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.4
        },
        {
            loc: '/shipping-details',
            lastmod: new Date().toISOString().split('T')[0],
            changefreq: 'monthly',
            priority: 0.4
        }
    ];

    generateSitemap(): Observable<string> {
        return forkJoin({
            products: this.api.products.list(),
            categories: this.api.categories.list()
        }).pipe(
            map(({ products, categories }) => {
                const allUrls: SitemapUrl[] = [...this.staticPages];

                // Add category pages
                categories.forEach((category: Category) => {
                    allUrls.push({
                        loc: `/products?category=${category.id}`,
                        lastmod: new Date().toISOString().split('T')[0],
                        changefreq: 'weekly',
                        priority: 0.7
                    });
                });

                // Add product pages
                const productList = Array.isArray(products) ? products : (products as any).data || [];
                productList.forEach((product: Product) => {
                    allUrls.push({
                        loc: `/products/${product.id}`,
                        lastmod: new Date(product.created_at).toISOString().split('T')[0],
                        changefreq: 'weekly',
                        priority: 0.8
                    });
                });

                return this.generateXMLSitemap(allUrls);
            })
        );
    }

    private generateXMLSitemap(urls: SitemapUrl[]): string {
        let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
        xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

        urls.forEach(url => {
            xml += `  <url>\n`;
            xml += `    <loc>${this.baseUrl}${url.loc}</loc>\n`;
            if (url.lastmod) {
                xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            }
            if (url.changefreq) {
                xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            }
            if (url.priority !== undefined) {
                xml += `    <priority>${url.priority}</priority>\n`;
            }
            xml += `  </url>\n`;
        });

        xml += `</urlset>`;
        return xml;
    }

    generateRobotsTxt(): string {
        return `User-agent: *
Allow: /

# Allow all pages except admin and user-specific pages
Disallow: /admin
Disallow: /admin/*
Disallow: /cart
Disallow: /cart/*
Disallow: /checkout
Disallow: /checkout/*
Disallow: /auth
Disallow: /auth/*
Disallow: /order-confirmation
Disallow: /orders
Disallow: /orders/*

# Allow important pages for SEO
Allow: /
Allow: /about
Allow: /products
Allow: /products/*
Allow: /privacy-policy
Allow: /terms-of-service
Allow: /returns-policy
Allow: /shipping-details

# Sitemap location
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay (be respectful)
Crawl-delay: 1

# Block known bad bots
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /
`;
    }
} 