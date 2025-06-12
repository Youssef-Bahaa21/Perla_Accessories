import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

export interface SocialMediaData {
    title: string;
    description: string;
    image: string;
    url?: string;
    type?: string;
    imageAlt?: string;
    imageWidth?: string;
    imageHeight?: string;
}

@Injectable({
    providedIn: 'root'
})
export class SocialMediaService {
    private defaultImage = 'https://perla-accessories.vercel.app/landing2.png';
    private defaultImageAlt = 'Perla Accessories - Premium handcrafted jewelry and accessories collection';
    private baseUrl = 'https://perla-accessories.vercel.app';

    constructor(
        private meta: Meta,
        private titleService: Title
    ) { }

    updateSocialMediaTags(data: SocialMediaData): void {
        // Update page title
        this.titleService.setTitle(data.title);

        // Update basic meta tags
        this.meta.updateTag({ name: 'description', content: data.description });

        // Update Open Graph tags
        this.meta.updateTag({ property: 'og:title', content: data.title });
        this.meta.updateTag({ property: 'og:description', content: data.description });
        this.meta.updateTag({ property: 'og:image', content: data.image || this.defaultImage });
        this.meta.updateTag({ property: 'og:image:alt', content: data.imageAlt || this.defaultImageAlt });
        this.meta.updateTag({ property: 'og:image:width', content: data.imageWidth || '1200' });
        this.meta.updateTag({ property: 'og:image:height', content: data.imageHeight || '630' });
        this.meta.updateTag({ property: 'og:url', content: data.url || this.baseUrl });
        this.meta.updateTag({ property: 'og:type', content: data.type || 'website' });

        // Update Twitter Card tags
        this.meta.updateTag({ name: 'twitter:title', content: data.title });
        this.meta.updateTag({ name: 'twitter:description', content: data.description });
        this.meta.updateTag({ name: 'twitter:image', content: data.image || this.defaultImage });
        this.meta.updateTag({ name: 'twitter:image:alt', content: data.imageAlt || this.defaultImageAlt });
    }

    updateProductSocialMedia(product: any): void {
        const productImage = this.getProductImageUrl(product);
        const productTitle = `${product.name} - Perla Accessories`;
        const productDescription = product.description ||
            `Beautiful ${product.name} from Perla Accessories. Handcrafted with premium quality materials. Price: ${product.price} EGP.`;

        this.updateSocialMediaTags({
            title: productTitle,
            description: productDescription,
            image: productImage,
            url: `${this.baseUrl}/products/${product.id}`,
            type: 'product',
            imageAlt: `${product.name} - Perla Accessories`
        });
    }

    updateCategorySocialMedia(category: string, products: any[]): void {
        const categoryTitle = `${category} Collection - Perla Accessories`;
        const categoryDescription = `Explore our ${category.toLowerCase()} collection. Handcrafted accessories and jewelry with premium quality. ${products.length} unique pieces available.`;

        // Use the first product image or default
        const categoryImage = products.length > 0 ? this.getProductImageUrl(products[0]) : this.defaultImage;

        this.updateSocialMediaTags({
            title: categoryTitle,
            description: categoryDescription,
            image: categoryImage,
            url: `${this.baseUrl}/products?category=${encodeURIComponent(category)}`,
            imageAlt: `${category} Collection - Perla Accessories`
        });
    }

    resetToDefault(): void {
        this.updateSocialMediaTags({
            title: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
            description: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
            image: this.defaultImage,
            url: this.baseUrl,
            imageAlt: this.defaultImageAlt
        });
    }

    updateHomepageWithProducts(products: any[]): void {
        // Use the best product image for homepage sharing
        let showcaseImage = this.defaultImage;
        let showcaseAlt = this.defaultImageAlt;

        if (products.length > 0) {
            // Try to find a featured or best-seller product with image
            const bestProduct = products.find(p => p.is_featured && p.images?.length) ||
                products.find(p => p.is_best_seller && p.images?.length) ||
                products.find(p => p.images?.length);

            if (bestProduct?.images?.[0]?.url) {
                showcaseImage = bestProduct.images[0].url;
                showcaseAlt = `${bestProduct.name} - Premium Perla Accessories Collection`;
            }
        }

        this.updateSocialMediaTags({
            title: 'Perla Accessories - Premium Handcrafted Collection',
            description: `Discover ${products.length} unique handcrafted accessories and jewelry pieces from Perla. Premium quality, limited edition designs that express your individual style.`,
            image: showcaseImage,
            url: this.baseUrl,
            imageAlt: showcaseAlt,
            type: 'website'
        });
    }

    private getProductImageUrl(product: any): string {
        if (product.images && product.images.length > 0) {
            const image = product.images[0];
            // If it's a full URL, use it directly
            if (image.startsWith('http')) {
                return image;
            }
            // If it's a relative path, make it absolute
            return `${this.baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
        }
        return this.defaultImage;
    }
} 