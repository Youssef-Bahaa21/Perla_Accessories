import { readFileSync } from 'fs';
import { join } from 'path';

const API_BASE_URL = 'https://web-production-cab5a.up.railway.app/api';

export default async function handler(req, res) {
  const { url } = req.query;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const baseUrl = 'https://perla-accessories.vercel.app';
    let metaData = {
      title: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
      description: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
      image: `${baseUrl}/landing2.png`,
      url: baseUrl,
      type: 'website'
    };

    // Parse URL to extract route information
    if (url && url.includes('/products/')) {
      const productId = url.split('/products/')[1];
      
      if (productId && !isNaN(parseInt(productId))) {
        // Fetch product data from your API
        try {
          const apiUrl = process.env.API_URL || 'https://web-production-cab5a.up.railway.app';
          const response = await fetch(`${apiUrl}/api/products/${productId}`);
          
          if (response.ok) {
            const product = await response.json();
            
            metaData = {
              title: `${product.name} - Premium Accessory by Perla`,
              description: product.description || `Shop ${product.name} from Perla's exclusive collection. Handcrafted with premium materials, this unique accessory is perfect for expressing your individual style. Price: ${product.price} EGP.`,
              image: product.images?.[0]?.url || product.images?.[0]?.image || `${baseUrl}/landing2.png`,
              url: `${baseUrl}/products/${productId}`,
              type: 'product',
              price: product.price,
              currency: 'EGP'
            };
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
          // Fall back to default meta data
        }
      }
    } else if (url && url.includes('/products?category=')) {
      const categoryMatch = url.match(/category=(\d+)/);
      if (categoryMatch) {
        const categoryId = categoryMatch[1];
        
        try {
          const apiUrl = process.env.API_URL || 'https://web-production-cab5a.up.railway.app';
          const response = await fetch(`${apiUrl}/api/categories/${categoryId}`);
          
          if (response.ok) {
            const category = await response.json();
            
            metaData = {
              title: `${category.name} Collection - Handcrafted Accessories`,
              description: category.description || `Explore our ${category.name.toLowerCase()} collection. Handcrafted accessories and jewelry designed to elevate your style.`,
              image: `${baseUrl}/landing2.png`,
              url: `${baseUrl}/products?category=${categoryId}`,
              type: 'website'
            };
          }
        } catch (error) {
          console.error('Error fetching category data:', error);
        }
      }
    }

    // Generate Open Graph meta tags
    const openGraphTags = `
      <meta property="og:title" content="${metaData.title}" />
      <meta property="og:description" content="${metaData.description}" />
      <meta property="og:image" content="${metaData.image}" />
      <meta property="og:image:secure_url" content="${metaData.image}" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content="${metaData.url}" />
      <meta property="og:type" content="${metaData.type}" />
      <meta property="og:site_name" content="Perla Accessories" />
      <meta property="og:locale" content="en_US" />
      
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="${metaData.title}" />
      <meta name="twitter:description" content="${metaData.description}" />
      <meta name="twitter:image" content="${metaData.image}" />
      <meta name="twitter:site" content="@perlaaccesories0" />
      
      <meta name="description" content="${metaData.description}" />
      <meta name="image" content="${metaData.image}" />
    `;

    res.status(200).json({
      success: true,
      meta: metaData,
      tags: openGraphTags
    });

  } catch (error) {
    console.error('Error generating meta tags:', error);
    res.status(500).json({ 
      error: 'Failed to generate meta tags',
      meta: {
        title: 'Perla Accessories',
        description: 'Premium handcrafted accessories and jewelry',
        image: 'https://perla-accessories.vercel.app/landing2.png'
      }
    });
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