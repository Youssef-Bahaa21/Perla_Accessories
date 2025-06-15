import { Injectable, inject, PLATFORM_ID, Inject, Optional } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';

export interface SEOData {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    price?: number;
    currency?: string;
    availability?: 'in_stock' | 'out_of_stock';
    brand?: string;
    category?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private meta = inject(Meta);
    private title = inject(Title);
    private router = inject(Router);
    private document = inject(DOCUMENT);
    private isBrowser: boolean;
    private isServer: boolean;

    private readonly defaultSEO = {
        title: 'Perla Accessories - Premium Jewelry & Fashion Accessories',
        description: 'Discover unique, limited-edition jewelry & accessories at Perla. Premium quality necklaces, earrings, rings & more. 3 years of exceptional craftsmanship.',
        keywords: 'jewelry, accessories, necklaces, earrings, rings, bracelets, fashion accessories, premium jewelry, limited edition, Egyptian jewelry',
        image: 'https://perla-accessories.onrender.com/logo.png',
        url: 'https://perla-accessories.onrender.com'
    };

    constructor(@Inject(PLATFORM_ID) private platformId: Object, @Optional() @Inject('REQUEST_CONTEXT') private requestContext: any) {
        this.isBrowser = isPlatformBrowser(this.platformId);
        this.isServer = isPlatformServer(this.platformId);
    }

    updateSEO(data: Partial<SEOData>): void {
        const currentUrl = this.isBrowser ? this.router.url : (this.requestContext?.url || '');
        const baseUrl = this.requestContext?.isBot ? 'https://perla-accessories.onrender.com' : this.defaultSEO.url;

        const seoData: SEOData = {
            ...this.defaultSEO,
            ...data,
            url: data.url || `${baseUrl}${currentUrl}`,
            title: data.title || this.defaultSEO.title,
            description: data.description || this.defaultSEO.description
        };

        // Always update title - works on both server and client
        this.title.setTitle(seoData.title!);

        // Update meta tags with enhanced SSR support
        this.updateMetaTags(seoData);
        this.updateOpenGraph(seoData);
        this.updateTwitterCard(seoData);
        this.updateCanonical(seoData.url!);

        // For server-side rendering, ensure immediate meta tag application
        if (this.isServer && this.requestContext?.isBot) {
            this.forceMetaTagsForCrawlers(seoData);
        }
    }

    private forceMetaTagsForCrawlers(data: SEOData): void {
        // Enhanced meta tag updates for social media crawlers
        // These are applied immediately during SSR

        // Standard meta tags
        this.meta.updateTag({ name: 'description', content: data.description! });
        this.meta.updateTag({ name: 'keywords', content: data.keywords || this.defaultSEO.keywords });

        // Open Graph tags
        this.meta.updateTag({ property: 'og:title', content: data.title! });
        this.meta.updateTag({ property: 'og:description', content: data.description! });
        this.meta.updateTag({ property: 'og:image', content: data.image || this.defaultSEO.image });
        this.meta.updateTag({ property: 'og:url', content: data.url! });
        this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
        this.meta.updateTag({ property: 'og:site_name', content: 'Perla Accessories' });

        // Twitter Card tags
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: data.title! });
        this.meta.updateTag({ name: 'twitter:description', content: data.description! });
        this.meta.updateTag({ name: 'twitter:image', content: data.image || this.defaultSEO.image });
    }

    private updateMetaTags(data: SEOData): void {
        this.meta.updateTag({ name: 'description', content: data.description! });
        this.meta.updateTag({ name: 'keywords', content: data.keywords || this.defaultSEO.keywords });
        this.meta.updateTag({ name: 'author', content: 'Perla Accessories' });
        this.meta.updateTag({ name: 'robots', content: 'index, follow' });
        this.meta.updateTag({ name: 'viewport', content: 'width=device-width, initial-scale=1' });

        // E-commerce specific
        if (data.type === 'product') {
            this.meta.updateTag({ name: 'product:price:amount', content: data.price?.toString() || '' });
            this.meta.updateTag({ name: 'product:price:currency', content: data.currency || 'EGP' });
            this.meta.updateTag({ name: 'product:availability', content: data.availability || 'in_stock' });
            this.meta.updateTag({ name: 'product:brand', content: data.brand || 'Perla' });
            this.meta.updateTag({ name: 'product:category', content: data.category || 'Accessories' });
        }
    }

    private updateOpenGraph(data: SEOData): void {
        this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
        this.meta.updateTag({ property: 'og:title', content: data.title! });
        this.meta.updateTag({ property: 'og:description', content: data.description! });
        this.meta.updateTag({ property: 'og:image', content: data.image || this.defaultSEO.image });
        this.meta.updateTag({ property: 'og:image:width', content: '1200' });
        this.meta.updateTag({ property: 'og:image:height', content: '630' });
        this.meta.updateTag({ property: 'og:image:alt', content: data.title! });
        this.meta.updateTag({ property: 'og:url', content: data.url || this.defaultSEO.url });
        this.meta.updateTag({ property: 'og:site_name', content: 'Perla Accessories' });
        this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

        // E-commerce specific Open Graph
        if (data.type === 'product') {
            this.meta.updateTag({ property: 'product:price:amount', content: data.price?.toString() || '' });
            this.meta.updateTag({ property: 'product:price:currency', content: data.currency || 'EGP' });
            this.meta.updateTag({ property: 'product:availability', content: data.availability || 'in_stock' });
        }
    }

    private updateTwitterCard(data: SEOData): void {
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:site', content: '@perlaaccessoriesboutique' });
        this.meta.updateTag({ name: 'twitter:creator', content: '@perlaaccessoriesboutique' });
        this.meta.updateTag({ name: 'twitter:title', content: data.title! });
        this.meta.updateTag({ name: 'twitter:description', content: data.description! });
        this.meta.updateTag({ name: 'twitter:image', content: data.image || this.defaultSEO.image });
        this.meta.updateTag({ name: 'twitter:url', content: data.url || this.defaultSEO.url });
    }

    private updateCanonical(url: string): void {
        // Remove existing canonical link
        const existingCanonical = this.document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            existingCanonical.remove();
        }

        // Add new canonical link
        const canonical = this.document.createElement('link');
        canonical.setAttribute('rel', 'canonical');
        canonical.setAttribute('href', url);
        this.document.head.appendChild(canonical);
    }

    // Generate breadcrumb structured data
    generateBreadcrumbs(breadcrumbs: Array<{ name: string; url: string }>): void {
        const structuredData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbs.map((crumb, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": crumb.name,
                "item": crumb.url
            }))
        };

        this.addStructuredData('breadcrumbs', structuredData);
    }

    // Add JSON-LD structured data
    addStructuredData(id: string, data: any): void {
        // Remove existing structured data with same id
        const existingScript = this.document.getElementById(id);
        if (existingScript) {
            existingScript.remove();
        }

        // Add new structured data
        const script = this.document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        this.document.head.appendChild(script);
    }

    // Generate organization structured data
    addOrganizationSchema(): void {
        const organizationSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Perla Accessories",
            "description": "Premium jewelry and fashion accessories boutique specializing in unique, limited-edition pieces",
            "url": "https://perla-accessories.onrender.com",
            "logo": "https://perla-accessories.onrender.com/logo.png",
            "foundingDate": "2022",
            "sameAs": [
                "https://www.instagram.com/perlaaccessoriesboutique",
                "https://www.tiktok.com/@perlaaccesories0"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": ["English", "Arabic"]
            },
            "address": {
                "@type": "PostalAddress",
                "addressCountry": "EG"
            }
        };

        this.addStructuredData('organization', organizationSchema);
    }

    // Generate product structured data
    addProductSchema(product: any): void {
        const productSchema = {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product.name,
            "description": product.description,
            "image": product.images?.map((img: any) => img.url || img.image) || [],
            "brand": {
                "@type": "Brand",
                "name": "Perla"
            },
            "offers": {
                "@type": "Offer",
                "price": product.price,
                "priceCurrency": "EGP",
                "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
                "seller": {
                    "@type": "Organization",
                    "name": "Perla Accessories"
                }
            },
            "aggregateRating": product.averageRating ? {
                "@type": "AggregateRating",
                "ratingValue": product.averageRating,
                "reviewCount": product.reviewCount
            } : undefined
        };

        this.addStructuredData('product', productSchema);
    }

    // Generate website structured data
    addWebsiteSchema(): void {
        const websiteSchema = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Perla Accessories",
            "url": "https://perla-accessories.onrender.com",
            "potentialAction": {
                "@type": "SearchAction",
                "target": "https://perla-accessories.onrender.com/products?search={search_term_string}",
                "query-input": "required name=search_term_string"
            }
        };

        this.addStructuredData('website', websiteSchema);
    }

    // Clean up all structured data (useful for navigation)
    clearStructuredData(): void {
        const scripts = this.document.querySelectorAll('script[type="application/ld+json"]');
        scripts.forEach(script => script.remove());
    }
} 