import { readFileSync } from 'fs';
import { join } from 'path';

const API_BASE_URL = 'https://web-production-cab5a.up.railway.app/api';

export default async function handler(req, res) {
  const userAgent = req.headers['user-agent'] || '';
  const url = req.url;
  
  // Check if it's a social media bot
  const isBotRequest = isBot(userAgent);
  
  if (!isBotRequest) {
    // Not a bot, redirect to normal Angular app
    return res.redirect(301, `https://perla-accessories.vercel.app${url}`);
  }
  
  try {
    // It's a bot, serve optimized HTML
    const html = await generateBotHTML(url);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);
  } catch (error) {
    console.error('Bot render error:', error);
    // Fallback to static HTML
    try {
      const staticHtml = readFileSync(
        join(process.cwd(), 'dist/client/browser/index.html'),
        'utf-8'
      );
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(staticHtml);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}

function isBot(userAgent) {
  const botPatterns = [
    'facebookexternalhit',
    'WhatsApp',
    'whatsapp',
    'Twitterbot',
    'LinkedInBot',
    'TelegramBot',
    'SkypeUriPreview',
    'SlackBot',
    'DiscordBot',
    'GoogleBot',
    'BingBot',
    'facebot',
    'facebook',
    'ia_archiver',
    'crawler',
    'bot',
    'spider'
  ];
  
  const userAgentLower = userAgent.toLowerCase();
  return botPatterns.some(pattern => 
    userAgentLower.includes(pattern.toLowerCase())
  );
}

async function generateBotHTML(url) {
  let metaTags = {};
  
  // Check if it's a product URL
  const productMatch = url.match(/\/products\/(\d+)/);
  
  if (productMatch) {
    const productId = productMatch[1];
    
    try {
      // Fetch product data
      const response = await fetch(`${API_BASE_URL}/products/${productId}`);
      
      if (response.ok) {
        const product = await response.json();
        metaTags = generateProductMetaTags(product);
      } else {
        metaTags = generateDefaultMetaTags();
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
      metaTags = generateDefaultMetaTags();
    }
  } else if (url.includes('/products')) {
    // Products listing page
    metaTags = generateProductsPageMetaTags();
  } else if (url.includes('/landing') || url === '/' || url === '') {
    // Homepage/landing page
    metaTags = await generateHomepageMetaTags();
  } else {
    metaTags = generateDefaultMetaTags();
  }
  
  return generateHTML(metaTags);
}

function generateProductMetaTags(product) {
  const productImage = product.images?.[0]?.url || 'https://perla-accessories.vercel.app/landing2.png';
  const title = `${product.name} - Perla Accessories`;
  const description = product.description || `Beautiful ${product.name} from Perla Accessories. Handcrafted with premium quality materials. Price: ${product.price} EGP.`;
  
  return {
    title,
    description,
    image: productImage,
    url: `https://perla-accessories.vercel.app/products/${product.id}`,
    type: 'product'
  };
}

function generateDefaultMetaTags() {
  return {
    title: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
    description: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app',
    type: 'website'
  };
}

function generateProductsPageMetaTags() {
  return {
    title: 'Shop All Products - Perla Accessories | Premium Jewelry Collection',
    description: 'Browse our complete collection of handcrafted accessories and jewelry. Find unique, limited edition pieces perfect for expressing your individual style.',
    image: 'https://perla-accessories.vercel.app/landing3.png',
    url: 'https://perla-accessories.vercel.app/products',
    type: 'website'
  };
}

async function generateHomepageMetaTags() {
  // Use the specific Landingbg.png image for landing page
  return {
    title: 'Perla Accessories - Premium Handcrafted Collection',
    description: 'Discover our exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
    image: 'https://perla-accessories.vercel.app/Landingbg.png',
    url: 'https://perla-accessories.vercel.app',
    type: 'website'
  };
}

function generateHTML(metaTags) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${metaTags.title}</title>
  <meta name="description" content="${metaTags.description}">
  
  <!-- Open Graph Meta Tags (Facebook, WhatsApp, etc.) -->
  <meta property="og:title" content="${metaTags.title}">
  <meta property="og:description" content="${metaTags.description}">
  <meta property="og:image" content="${metaTags.image}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:type" content="image/png">
  <meta property="og:url" content="${metaTags.url}">
  <meta property="og:type" content="${metaTags.type}">
  <meta property="og:site_name" content="Perla Accessories">
  <meta property="og:locale" content="en_US">
  
  <!-- WhatsApp specific meta tags -->
  <meta name="image" content="${metaTags.image}">
  <meta property="whatsapp:image" content="${metaTags.image}">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metaTags.title}">
  <meta name="twitter:description" content="${metaTags.description}">
  <meta name="twitter:image" content="${metaTags.image}">
  <meta name="twitter:image:alt" content="${metaTags.title}">
  
  <!-- Additional meta tags for better social sharing -->
  <meta name="author" content="Perla Accessories">
  <meta name="robots" content="index, follow">
  
  <!-- Redirect to actual site for real users -->
  <script>
    // Only redirect if not a bot
    if (typeof navigator !== 'undefined' && !/(facebook|whatsapp|twitter|telegram|skype|slack|discord|google|bing|bot|crawler|spider)/i.test(navigator.userAgent)) {
      setTimeout(function() {
        window.location.href = '${metaTags.url}';
      }, 1000);
    }
  </script>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <h1 style="color: #ec4899; margin-bottom: 10px;">${metaTags.title}</h1>
    <p style="color: #666; margin-bottom: 20px;">${metaTags.description}</p>
    <img src="${metaTags.image}" alt="${metaTags.title}" style="width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
    
    <div style="text-align: center;">
      <a href="${metaTags.url}" style="display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Perla Accessories</a>
    </div>
    
    <p style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
      If you are not redirected automatically, <a href="${metaTags.url}" style="color: #ec4899;">click here</a>.
    </p>
  </div>
</body>
</html>`;
} 