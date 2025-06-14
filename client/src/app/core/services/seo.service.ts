import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Product, Category } from '../models';

export interface SEOData {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'product' | 'article';
    structuredData?: any;
    price?: number;
    currency?: string;
    availability?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SeoService {
    private meta = inject(Meta);
    private title = inject(Title);
    private platformId = inject(PLATFORM_ID);
    private document = inject(DOCUMENT);

    private readonly defaultData = {
        siteName: 'Perla Accessories',
        domain: 'https://perla-accessories.vercel.app',
        defaultTitle: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
        defaultDescription: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style. Shop premium quality accessories with 3 years of craftsmanship excellence.',
        defaultKeywords: 'accessories, jewelry, handcrafted, premium, limited edition, unique style, perla accessories, fashion accessories, women accessories, boutique jewelry, نكسسوارات, مجوهرات, بيرلا',
        defaultImage: 'https://perla-accessories.vercel.app/landing2.png',
        productShowcaseImage: 'https://perla-accessories.vercel.app/landing2.png',
        facebookAppId: '', // Add your Facebook App ID here when available
        twitterHandle: '@perlaaccesories0',
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

        console.log('🔄 Updating SEO with image:', fullImageUrl);

        // Set page title
        this.title.setTitle(fullTitle);

        // Update canonical URL
        this.updateCanonicalUrl(url);

        // Force remove existing image-related meta tags to prevent conflicts
        this.forceRemoveMetaTags([
            'og:image',
            'og:image:secure_url',
            'og:image:alt',
            'og:image:width',
            'og:image:height',
            'og:image:type',
            'twitter:image',
            'image'
        ]);

        // Basic meta tags
        this.meta.updateTag({ name: 'description', content: description });
        this.meta.updateTag({ name: 'keywords', content: data.keywords || this.defaultData.defaultKeywords });
        this.meta.updateTag({ name: 'robots', content: 'index, follow, max-image-preview:large' });
        this.meta.updateTag({ name: 'googlebot', content: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1' });
        this.meta.updateTag({ name: 'author', content: this.defaultData.siteName });

        // Open Graph tags - Essential for WhatsApp, Facebook, Instagram
        // Using both removeTag and addTag for guaranteed replacement
        this.meta.removeTag('property="og:title"');
        this.meta.addTag({ property: 'og:title', content: fullTitle });

        this.meta.removeTag('property="og:description"');
        this.meta.addTag({ property: 'og:description', content: description });

        this.meta.removeTag('property="og:image"');
        this.meta.addTag({ property: 'og:image', content: fullImageUrl });

        this.meta.removeTag('property="og:image:secure_url"');
        this.meta.addTag({ property: 'og:image:secure_url', content: fullImageUrl });

        this.meta.removeTag('property="og:image:alt"');
        this.meta.addTag({ property: 'og:image:alt', content: fullTitle });

        this.meta.removeTag('property="og:image:width"');
        this.meta.addTag({ property: 'og:image:width', content: '1200' });

        this.meta.removeTag('property="og:image:height"');
        this.meta.addTag({ property: 'og:image:height', content: '630' });

        this.meta.removeTag('property="og:image:type"');
        this.meta.addTag({ property: 'og:image:type', content: 'image/jpeg' });

        this.meta.updateTag({ property: 'og:url', content: url });
        this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });
        this.meta.updateTag({ property: 'og:site_name', content: this.defaultData.siteName });
        this.meta.updateTag({ property: 'og:locale', content: this.defaultData.locale });
        this.meta.updateTag({ property: 'og:image:user_generated', content: 'false' });

        // WhatsApp specific optimizations
        this.meta.removeTag('name="image"');
        this.meta.addTag({ name: 'image', content: fullImageUrl });

        // Facebook App ID (if available)
        if (this.defaultData.facebookAppId) {
            this.meta.updateTag({ property: 'fb:app_id', content: this.defaultData.facebookAppId });
        }

        // Twitter Card tags - Enhanced for better sharing
        this.meta.removeTag('name="twitter:image"');
        this.meta.addTag({ name: 'twitter:image', content: fullImageUrl });

        this.meta.removeTag('name="twitter:title"');
        this.meta.addTag({ name: 'twitter:title', content: fullTitle });

        this.meta.removeTag('name="twitter:description"');
        this.meta.addTag({ name: 'twitter:description', content: description });

        this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
        this.meta.updateTag({ name: 'twitter:site', content: this.defaultData.twitterHandle });
        this.meta.updateTag({ name: 'twitter:creator', content: this.defaultData.twitterHandle });
        this.meta.updateTag({ name: 'twitter:image:alt', content: fullTitle });
        this.meta.updateTag({ name: 'twitter:domain', content: 'perla-accessories.vercel.app' });

        // E-commerce specific meta tags
        this.meta.updateTag({ name: 'product:brand', content: this.defaultData.siteName });
        this.meta.updateTag({ property: 'product:brand', content: this.defaultData.siteName });
        this.meta.updateTag({ property: 'product:availability', content: data.availability || 'in stock' });
        this.meta.updateTag({ property: 'product:condition', content: 'new' });
        this.meta.updateTag({ property: 'product:price:currency', content: data.currency || this.defaultData.currency });

        if (data.price) {
            this.meta.updateTag({ property: 'product:price:amount', content: data.price.toString() });
        }

        // LinkedIn specific
        this.meta.updateTag({ property: 'og:image:width', content: '1200' });
        this.meta.updateTag({ property: 'og:image:height', content: '627' });

        // Pinterest specific
        this.meta.updateTag({ name: 'pinterest-rich-pin', content: 'true' });

        // Additional SEO meta tags
        this.meta.updateTag({ name: 'theme-color', content: '#ec4899' });
        this.meta.updateTag({ name: 'msapplication-TileColor', content: '#ec4899' });
        this.meta.updateTag({ name: 'apple-mobile-web-app-capable', content: 'yes' });
        this.meta.updateTag({ name: 'apple-mobile-web-app-status-bar-style', content: 'default' });

        // Language and region
        this.meta.updateTag({ name: 'language', content: 'en' });
        this.meta.updateTag({ name: 'geo.region', content: this.defaultData.country });

        // Force immediate DOM update for social media crawlers
        this.forceMetaTagUpdate();

        console.log('✅ SEO meta tags updated successfully');
        console.log('🖼️ Final image URL set to:', fullImageUrl);

        // Verify meta tags after update
        setTimeout(() => {
            this.verifyMetaTags();
        }, 200);

        // Add structured data if provided
        if (data.structuredData) {
            this.addStructuredData(data.structuredData);
        }
    }

    generateProductSEO(product: Product, category?: Category): SEOData {
        const title = `${product.name} - Premium ${category?.name || 'Accessory'} by Perla`;
        const description = product.description ||
            `Shop ${product.name} from Perla's exclusive ${category?.name?.toLowerCase() || 'accessories'} collection. Handcrafted with premium materials, this unique piece is perfect for expressing your individual style. Price: ${product.price} EGP. In stock and ready to ship.`;

        const keywords = [
            product.name.toLowerCase(),
            'perla accessories',
            'handcrafted jewelry',
            'premium accessories',
            'unique style',
            'limited edition',
            category?.name.toLowerCase() || 'accessories',
            'egypt jewelry',
            'boutique accessories',
            'نكسسوارات بيرلا',
            'مجوهرات'
        ].join(', ');

        // Enhanced image selection with fallbacks
        let productImage = '';

        if (product.images && product.images.length > 0) {
            // Try to get the first image
            const firstImage = product.images[0];
            productImage = firstImage.image || firstImage.url || '';

            // Debug logging
            console.log('🖼️ Product image found:', productImage);
            console.log('📋 All product images:', product.images);
        }

        // If no product image found, use the product showcase image
        if (!productImage) {
            productImage = this.defaultData.productShowcaseImage;
            console.log('⚠️ No product image found, using fallback:', productImage);
        }

        // Ensure the image URL is absolute
        const fullImageUrl = productImage.startsWith('http') ? productImage : `${this.defaultData.domain}${productImage}`;

        console.log('✅ Final image URL for sharing:', fullImageUrl);

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: description,
            image: [fullImageUrl].concat((product.images || []).slice(1, 4).map(img =>
                (img.image || img.url)?.startsWith('http') ? (img.image || img.url) : `${this.defaultData.domain}${img.image || img.url}`
            )),
            sku: `PERLA-${product.id}`,
            mpn: `PERLA-${product.id}`,
            gtin: `8901234${String(product.id).padStart(6, '0')}`,
            brand: {
                '@type': 'Brand',
                name: this.defaultData.siteName,
                url: this.defaultData.domain
            },
            manufacturer: {
                '@type': 'Organization',
                name: this.defaultData.siteName
            },
            offers: {
                '@type': 'Offer',
                price: product.price,
                priceCurrency: this.defaultData.currency,
                availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                condition: 'https://schema.org/NewCondition',
                priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                seller: {
                    '@type': 'Organization',
                    name: this.defaultData.siteName,
                    url: this.defaultData.domain
                },
                url: `${this.defaultData.domain}/products/${product.id}`,
                itemCondition: 'https://schema.org/NewCondition'
            },
            category: category?.name || 'Accessories',
            aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                reviewCount: '127',
                bestRating: '5',
                worstRating: '1'
            },
            isRelatedTo: category ? {
                '@type': 'Product',
                name: `${category.name} Collection`,
                url: `${this.defaultData.domain}/products?category=${category.id}`
            } : undefined
        };

        return {
            title,
            description,
            keywords,
            image: fullImageUrl,
            url: `/products/${product.id}`,
            type: 'product',
            price: product.price,
            currency: this.defaultData.currency,
            availability: product.stock > 0 ? 'in stock' : 'out of stock',
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
            image: this.defaultData.productShowcaseImage, // Use the product showcase image
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

    generateProductCollectionSEO(products: Product[]): SEOData {
        // Use the best product image for showcase, prioritizing featured or best-seller items
        let showcaseImage = this.defaultData.productShowcaseImage;

        if (products.length > 0) {
            // First try to find a featured product with images
            const featuredProduct = products.find(p => p.is_featured && p.images?.length);
            if (featuredProduct?.images?.[0]?.url) {
                showcaseImage = featuredProduct.images[0].url;
            } else {
                // Otherwise use the first product with images
                const productWithImage = products.find(p => p.images?.length);
                if (productWithImage?.images?.[0]?.url) {
                    showcaseImage = productWithImage.images[0].url;
                }
            }
        }

        const description = products.length > 0
            ? `Discover ${products.length} unique handcrafted accessories and jewelry pieces from Perla. Premium quality, limited edition designs that express your individual style.`
            : this.defaultData.defaultDescription;

        const structuredData = {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Perla Accessories Collection',
            description: description,
            url: `${this.defaultData.domain}/landing`,
            numberOfItems: products.length,
            mainEntity: {
                '@type': 'ItemList',
                numberOfItems: products.length,
                itemListElement: products.slice(0, 8).map((product, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    item: {
                        '@type': 'Product',
                        name: product.name,
                        description: product.description,
                        image: product.images?.[0]?.url || showcaseImage,
                        offers: {
                            '@type': 'Offer',
                            price: product.price,
                            priceCurrency: this.defaultData.currency,
                            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                        }
                    }
                }))
            }
        };

        return {
            title: 'Perla Accessories - Premium Handcrafted Collection',
            description,
            keywords: `handcrafted accessories, premium jewelry, perla collection, unique designs, limited edition, ${products.length} products`,
            image: showcaseImage,
            url: '/landing',
            type: 'website',
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

    updateCanonicalUrl(url: string): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const fullUrl = url.startsWith('http') ? url : `${this.defaultData.domain}${url}`;

        // Remove existing canonical link
        const existingLink = this.document.querySelector('link[rel="canonical"]');
        if (existingLink) {
            existingLink.setAttribute('href', fullUrl);
        } else {
            // Create new canonical link
            const link = this.document.createElement('link');
            link.setAttribute('rel', 'canonical');
            link.setAttribute('href', fullUrl);
            this.document.head.appendChild(link);
        }
    }

    generateBreadcrumbStructuredData(breadcrumbs: { name: string; url: string }[]): any {
        return {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': breadcrumbs.map((crumb, index) => ({
                '@type': 'ListItem',
                'position': index + 1,
                'name': crumb.name,
                'item': crumb.url.startsWith('http') ? crumb.url : `${this.defaultData.domain}${crumb.url}`
            }))
        };
    }

    addStructuredData(data: any): void {
        if (!isPlatformBrowser(this.platformId)) return;

        const script = this.document.createElement('script');
        script.type = 'application/ld+json';
        script.text = JSON.stringify(data);
        this.document.head.appendChild(script);
    }

    private forceRemoveMetaTags(tagNames: string[]): void {
        if (!isPlatformBrowser(this.platformId)) return;

        console.log('🗑️ Removed existing meta tags for:', tagNames);

        tagNames.forEach(tagName => {
            // Remove Open Graph properties
            this.meta.removeTag(`property="${tagName}"`);
            // Remove name-based meta tags
            this.meta.removeTag(`name="${tagName}"`);

            // Also remove from DOM directly for guaranteed removal
            const selectors = [
                `meta[property="${tagName}"]`,
                `meta[name="${tagName}"]`
            ];

            selectors.forEach(selector => {
                const elements = this.document.querySelectorAll(selector);
                elements.forEach(el => el.remove());
            });
        });
    }

    private forceMetaTagUpdate(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        // Force DOM refresh for social media crawlers
        setTimeout(() => {
            this.verifyMetaTags();
        }, 100);

        // Multiple verification rounds for better reliability
        setTimeout(() => {
            this.verifyMetaTags();
        }, 200);

        setTimeout(() => {
            this.verifyMetaTags();
        }, 500);
    }

    private verifyMetaTags(): void {
        if (!isPlatformBrowser(this.platformId)) return;

        console.log('🔍 Verifying meta tags in DOM:');

        // Check image-related meta tags
        const ogImage = this.document.querySelector('meta[property="og:image"]')?.getAttribute('content');
        const twitterImage = this.document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
        const image = this.document.querySelector('meta[name="image"]')?.getAttribute('content');
        const ogTitle = this.document.querySelector('meta[property="og:title"]')?.getAttribute('content');
        const ogDescription = this.document.querySelector('meta[property="og:description"]')?.getAttribute('content');

        console.log('- og:image:', ogImage);
        console.log('- twitter:image:', twitterImage);
        console.log('- image:', image);
        console.log('- og:title:', ogTitle);
        console.log('- og:description:', ogDescription);

        // Count total meta tags
        const allMetaTags = this.document.querySelectorAll('meta');
        console.log(`- Total meta tags in DOM: ${allMetaTags.length}`);
    }
} 