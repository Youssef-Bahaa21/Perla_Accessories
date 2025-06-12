import { readFileSync } from 'fs';
import { join } from 'path';

const API_BASE_URL = 'https://web-production-cab5a.up.railway.app/api';

export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    // Check if it's a product URL
    const productMatch = url.match(/\/products\/(\d+)/);
    
    if (productMatch) {
      const productId = productMatch[1];
      
      // Fetch product data
      const productResponse = await fetch(`${API_BASE_URL}/products/${productId}`);
      
      if (productResponse.ok) {
        const product = await productResponse.json();
        
        // Generate meta tags for the product
        const metaTags = generateProductMetaTags(product);
        return res.status(200).json({ metaTags, type: 'product' });
      }
    }
    
    // Default meta tags for non-product pages
    const defaultMetaTags = generateDefaultMetaTags();
    return res.status(200).json({ metaTags: defaultMetaTags, type: 'default' });
    
  } catch (error) {
    console.error('Meta API Error:', error);
    const defaultMetaTags = generateDefaultMetaTags();
    return res.status(200).json({ metaTags: defaultMetaTags, type: 'error' });
  }
}

function generateProductMetaTags(product) {
  const productImage = product.images?.[0]?.url || 'https://perla-accessories.vercel.app/landing2.png';
  const title = `${product.name} - Perla Accessories`;
  const description = product.description || `Beautiful ${product.name} from Perla Accessories. Handcrafted with premium quality materials. Price: ${product.price} EGP.`;
  
  return {
    title,
    description,
    'og:title': title,
    'og:description': description,
    'og:image': productImage,
    'og:url': `https://perla-accessories.vercel.app/products/${product.id}`,
    'og:type': 'product',
    'og:site_name': 'Perla Accessories',
    'twitter:card': 'summary_large_image',
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': productImage
  };
}

function generateDefaultMetaTags() {
  return {
    title: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
    description: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
    'og:title': 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
    'og:description': 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
    'og:image': 'https://perla-accessories.vercel.app/landing2.png',
    'og:url': 'https://perla-accessories.vercel.app',
    'og:type': 'website',
    'og:site_name': 'Perla Accessories',
    'twitter:card': 'summary_large_image',
    'twitter:title': 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
    'twitter:description': 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry.',
    'twitter:image': 'https://perla-accessories.vercel.app/landing2.png'
  };
} 