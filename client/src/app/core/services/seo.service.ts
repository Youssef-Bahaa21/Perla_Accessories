import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser } from '@angular/common';
import { Product, Category } from '../models';

export interface SEOData {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    structuredData?: any;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private meta = inject(Meta);
    private title = inject(Title);
    private platformId = inject(PLATFORM_ID);

    private readonly defaultData = {
        siteName: 'Perla Accessories',
        domain: 'https://perla-accessories.vercel.app',
        defaultTitle: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
        defaultDescription: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style. Shop premium quality accessories with 3 years of craftsmanship excellence.',
        defaultKeywords: 'accessories, jewelry, handcrafted, premium, limited edition, unique style, perla accessories, fashion accessories, women accessories, boutique jewelry',
        defaultImage: '/assets/images/perla-og-image.jpg',
        locale: 'en_US',
        currency: 'EGP',
        country: 'EG'
    };

    updateSEO(data: SEOData): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const fullTitle = data.title
            ? `${data.title} | ${this.defaultData.siteName}`
            : this.defaultData.defaultTitle;

        const description = data.description || this.defaultData.defaultDescription;
        const image = data.image || this.defaultData.defaultImage;
        const fullImageUrl = image.startsWith('http') ? image : `${this.defaultData.domain}${image}`;
        const url = data.url ? `${this.defaultData.domain}${data.url}` : this.defaultData.domain;

        // Set page title
        this.title.setTitle(fullTitle);

        // Basic meta tags
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ name: 'keywords', content: data.keywords || this.defaultData.defaultKeywords });
        this.meta.updateTag({ name: 'robots', content: 'index, follow' });
        this.meta.updateTag({ name: 'author', content: this.defaultData.siteName });

        // Open Graph tags
        this.meta.updateTag({ property: 'og:title', content: fullTitle });
        this.meta.updateTag({ property: 'og:description', content: description });
        this.meta.updateTag({ property: 'og:image', content: fullImageUrl });
        this.meta.updateTag({ property: 'og:image:alt', content: fullTitle });
        this.meta.updateTag({ property: 'og:url', content: url });
        this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
        this.meta.updateTag({ property: 'og:site_name', content: this.defaultData.siteName });
        this.meta.updateTag({ property: 'og:locale', content: this.defaultData.locale });

        // Twitter Card tags
        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
        this.meta.updateTag({ name: 'twitter:description', content: description });
        this.meta.updateTag({ name: 'twitter:image', content: fullImageUrl });
        this.meta.updateTag({ name: 'twitter:image:alt', content: fullTitle });

        // E-commerce specific meta tags
        this.meta.updateTag({ name: 'product:brand', content: this.defaultData.siteName });
        this.meta.updateTag({ name: 'product:availability', content: 'in stock' });
        this.meta.updateTag({ name: 'product:condition', content: 'new' });
        this.meta.updateTag({ name: 'product:price:currency', content: this.defaultData.currency });

        // Additional SEO meta tags
        this.meta.updateTag({ name: 'theme-color', content: '#ec4899' });
        this.meta.updateTag({ name: 'msapplication-TileColor', content: '#ec4899' });
        this.meta.updateTag({ name: 'apple-mobile-web-app-capable', content: 'yes' });
        this.meta.updateTag({ name: 'apple-mobile-web-app-status-bar-style', content: 'default' });

        // Add structured data if provided
        if (data.structuredData) {
            this.addStructuredData(data.structuredData);
        }
    }

    generateProductSEO(product: Product, category?: Category): SEOData {
        const title = `${product.name} - Premium Accessory by Perla`;
        const description = product.description ||
            `Shop ${product.name} from Perla's exclusive collection. Handcrafted with premium materials, this unique accessory is perfect for expressing your individual style. Price: ${product.price} EGP.`;

        const keywords = [
            product.name.toLowerCase(),
            'perla accessories',
            'handcrafted jewelry',
            'premium accessories',
            'unique style',
            'limited edition',
            category?.name.toLowerCase() || 'accessories'
        ].join(', ');

        const image = product.images?.[0]?.url || this.defaultData.defaultImage;

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: description,
            image: image.startsWith('http') ? image : `${this.defaultData.domain}${image}`,
            sku: `PERLA-${product.id}`,
            brand: {
                '@type': 'Brand',
                name: this.defaultData.siteName
            },
            offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: this.defaultData.currency,
                availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                condition: 'https://schema.org/NewCondition',
                seller: {
                    '@type': 'Organization',
                    name: this.defaultData.siteName
                }
            },
            category: category?.name || 'Accessories',
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '127'
            }
        };

        return {
            title,
            description,
            keywords,
            image,
            url: `/products/${product.id}`,
            type: 'product',
            structuredData
        };
    }

    generateCategorySEO(category: Category): SEOData {
        const title = `${category.name} Collection - Handcrafted Accessories`;
        const description = category.description ||
            `Explore our ${category.name.toLowerCase()} collection. Handcrafted accessories and jewelry designed to elevate your style. Premium quality, unique designs, and limited edition pieces.`;

        const keywords = [
            category.name.toLowerCase(),
            'perla accessories',
            'handcrafted',
            'premium accessories',
            'unique jewelry',
            'limited edition'
        ].join(', ');

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${category.name} Collection`,
            description: description,
            url: `${this.defaultData.domain}/products?category=${category.id}`,
            isPartOf: {
                '@type': 'WebSite',
                name: this.defaultData.siteName,
                url: this.defaultData.domain
            }
        };

        return {
            title,
            description,
            keywords,
            url: `/products?category=${category.id}`,
            type: 'website',
            structuredData
        };
    }

    generateHomepageSEO(): SEOData {
        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: this.defaultData.siteName,
            url: this.defaultData.domain,
            logo: `${this.defaultData.domain}/logo.png`,
            description: this.defaultData.defaultDescription,
            foundingDate: '2021',
            founder: {
                '@type': 'Person',
                name: 'Perla Team'
            },
            sameAs: [
                'https://www.instagram.com/perlaaccessoriesboutique',
                'https://www.tiktok.com/@perlaaccesories0'
            ],
            contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: ['Arabic', 'English']
            },
            areaServed: {
                '@type': 'Country',
                name: 'Egypt'
            },
            hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Perla Accessories Catalog',
                itemListElement: [
                    {
                        '@type': 'Offer',
                        itemOffered: {
                            '@type': 'Product',
                            name: 'Handcrafted Accessories',
                            category: 'Jewelry & Accessories'
                        }
                    }
                ]
            }
        };

        return {
            title: undefined, // Will use default
            description: undefined, // Will use default
            keywords: this.defaultData.defaultKeywords,
            url: '/',
            type: 'website',
            structuredData
        };
    }

    generateAboutSEO(): SEOData {
        const title = 'About Perla - 3 Years of Handcrafted Excellence';
        const description = 'Learn about Perla\'s journey creating unique, handcrafted accessories for 3 years. Discover our mission, values, and commitment to premium quality limited edition pieces that express your individual style.';

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: title,
            description: description,
            url: `${this.defaultData.domain}/about`,
            mainEntity: {
                '@type': 'Organization',
                name: this.defaultData.siteName,
                foundingDate: '2021',
                description: 'Premium handcrafted accessories and jewelry brand',
                specialty: 'Limited edition handcrafted accessories'
            }
        };

        return {
            title,
            description,
            keywords: 'about perla, handcrafted accessories, brand story, premium jewelry, limited edition',
            url: '/about',
            type: 'article',
            structuredData
        };
    }

    generatePrivacyPolicySEO(): SEOData {
        const title = 'Privacy Policy - How We Protect Your Information';
        const description = 'Learn how Perla Accessories protects your personal information, uses cookies, and handles your data. We are committed to maintaining your privacy and security when shopping with us.';

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description,
            url: `${this.defaultData.domain}/privacy-policy`,
            isPartOf: {
                '@type': 'WebSite',
                name: this.defaultData.siteName,
                url: this.defaultData.domain
            }
        };

        return {
            title,
            description,
            keywords: 'privacy policy, data protection, cookies, personal information, security, perla accessories',
            url: '/privacy-policy',
            type: 'article',
            structuredData
        };
    }

    generateTermsOfServiceSEO(): SEOData {
        const title = 'Terms of Service - Shopping Terms & Conditions';
        const description = 'Read our terms of service for shopping at Perla Accessories. Learn about our policies, returns, shipping, and what to expect when purchasing our handcrafted accessories.';

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description,
            url: `${this.defaultData.domain}/terms-of-service`,
            isPartOf: {
                '@type': 'WebSite',
                name: this.defaultData.siteName,
                url: this.defaultData.domain
            }
        };

        return {
            title,
            description,
            keywords: 'terms of service, terms and conditions, shopping policy, returns, shipping, perla accessories',
            url: '/terms-of-service',
            type: 'article',
            structuredData
        };
    }

    generateReturnsOrShippingPolicySEO(pageType: 'returns' | 'shipping'): SEOData {
        const isReturns = pageType === 'returns';
        const title = isReturns
            ? 'Returns & Exchange Policy - Easy Returns Process'
            : 'Shipping Information - Fast & Secure Delivery';

        const description = isReturns
            ? 'Learn about our hassle-free returns and exchange policy. We make it easy to return or exchange your Perla accessories if you\'re not completely satisfied.'
            : 'Get information about our shipping process, delivery times, and fees. We offer fast, secure shipping across Egypt for all Perla accessories orders.';

        const url = isReturns ? '/returns-policy' : '/shipping-details';
        const keywords = isReturns
            ? 'returns policy, exchange policy, refunds, hassle-free returns, perla accessories'
            : 'shipping information, delivery, shipping fees, fast shipping, secure delivery, perla accessories';

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: title,
            description: description,
            url: `${this.defaultData.domain}${url}`,
            isPartOf: {
                '@type': 'WebSite',
                name: this.defaultData.siteName,
                url: this.defaultData.domain
            }
        };

        return {
            title,
            description,
            keywords,
            url,
            type: 'article',
            structuredData
        };
    }

    private addStructuredData(data: any): void {
        if (!isPlatformBrowser(this.platformId)) return;

        // Remove existing structured data
        const existingScript = document.querySelector('script[type="application/ld+json"]');
        if (existingScript) {
            existingScript.remove();
        }

        // Add new structured data
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
    }

    generateBreadcrumbStructuredData(breadcrumbs: Array<{ name: string, url: string }>): any {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: crumb.name,
                item: `${this.defaultData.domain}${crumb.url}`
            }))
        };
    }

    updateCanonicalUrl(url: string): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const canonicalUrl = `${this.defaultData.domain}${url}`;

        // Remove existing canonical tag
        const existingCanonical = document.querySelector('link[rel="canonical"]');
        if (existingCanonical) {
            existingCanonical.remove();
        }

        // Add new canonical tag
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = canonicalUrl;
        document.head.appendChild(link);
    }
} 