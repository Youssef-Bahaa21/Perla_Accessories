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
    'Twitterbot',
    'LinkedInBot',
    'TelegramBot',
    'SkypeUriPreview',
    'SlackBot',
    'DiscordBot',
    'GoogleBot',
    'BingBot'
  ];
  
  return botPatterns.some(pattern => 
    userAgent.toLowerCase().includes(pattern.toLowerCase())
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
  } else if (url === '/' || url === '/landing') {
    metaTags = generateHomepageMetaTags();
  } else if (url === '/products') {
    metaTags = generateProductsPageMetaTags();
  } else if (url === '/privacy-policy') {
    metaTags = generatePrivacyPolicyMetaTags();
  } else if (url === '/terms') {
    metaTags = generateTermsMetaTags();
  } else if (url === '/returns-policy') {
    metaTags = generateReturnsPolicyMetaTags();
  } else if (url.startsWith('/account')) {
    metaTags = generateAccountMetaTags();
  } else if (url === '/cart') {
    metaTags = generateCartMetaTags();
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

function generateHomepageMetaTags() {
  return {
    title: 'Perla Accessories - Premium Handcrafted Accessories & Jewelry',
    description: 'Discover Perla\'s exclusive collection of handcrafted accessories and jewelry. Unique, limited edition pieces designed to express your individual style.',
    image: 'https://perla-accessories.vercel.app/Landingbg.png',
    url: 'https://perla-accessories.vercel.app',
    type: 'website'
  };
}

function generateProductsPageMetaTags() {
  return {
    title: 'Shop All Products - Perla Accessories | Jewelry & Accessories',
    description: 'Browse our complete collection of handcrafted accessories and jewelry. Premium quality, unique designs, and limited edition pieces to express your style.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app/products',
    type: 'website'
  };
}

function generatePrivacyPolicyMetaTags() {
  return {
    title: 'Privacy Policy - Perla Accessories',
    description: 'Learn how Perla Accessories protects your personal information and handles your data. We are committed to maintaining your privacy and security.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app/privacy-policy',
    type: 'article'
  };
}

function generateTermsMetaTags() {
  return {
    title: 'Terms of Service - Perla Accessories',
    description: 'Read our terms of service for shopping at Perla Accessories. Learn about our policies, returns, shipping, and purchasing terms.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app/terms',
    type: 'article'
  };
}

function generateReturnsPolicyMetaTags() {
  return {
    title: 'Returns Policy - Perla Accessories',
    description: 'Learn about our hassle-free returns and exchange policy. We make it easy to return or exchange your Perla accessories.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app/returns-policy',
    type: 'article'
  };
}

function generateAccountMetaTags() {
  return {
    title: 'My Account - Perla Accessories',
    description: 'Manage your Perla Accessories account, view orders, and track your purchases.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app/account',
    type: 'website'
  };
}

function generateCartMetaTags() {
  return {
    title: 'Shopping Cart - Perla Accessories',
    description: 'Review your selected items and complete your purchase of beautiful handcrafted accessories.',
    image: 'https://perla-accessories.vercel.app/landing2.png',
    url: 'https://perla-accessories.vercel.app/cart',
    type: 'website'
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

function generateHTML(metaTags) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${metaTags.title}</title>
  <meta name="description" content="${metaTags.description}">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:title" content="${metaTags.title}">
  <meta property="og:description" content="${metaTags.description}">
  <meta property="og:image" content="${metaTags.image}">
  <meta property="og:url" content="${metaTags.url}">
  <meta property="og:type" content="${metaTags.type}">
  <meta property="og:site_name" content="Perla Accessories">
  
  <!-- WhatsApp Meta Tags -->
  <meta name="image" content="${metaTags.image}">
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${metaTags.title}">
  <meta name="twitter:description" content="${metaTags.description}">
  <meta name="twitter:image" content="${metaTags.image}">
  
  <!-- Better redirect logic for WhatsApp users -->
  <script>
    // Improved redirect logic - check if it's a real user interaction
    const userAgent = navigator.userAgent || '';
    const isWhatsApp = /WhatsApp/i.test(userAgent);
    const isBot = /(facebook|whatsapp|twitter|telegram|skype|slack|discord|google|bing)bot/i.test(userAgent);
    
    // If it's WhatsApp but likely a user click (not a bot crawl), redirect
    if (isWhatsApp && !isBot) {
      // Small delay to ensure proper loading
      setTimeout(() => {
        window.location.href = '${metaTags.url}';
      }, 100);
    } else if (!isBot) {
      // For other non-bot traffic, redirect immediately
      window.location.href = '${metaTags.url}';
    }
  </script>
  
  <!-- Fallback meta refresh for additional safety -->
  <meta http-equiv="refresh" content="2;url=${metaTags.url}">
</head>
<body>
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center;">
    <img src="${metaTags.image}" alt="${metaTags.title}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 20px;">
    <h1 style="color: #ec4899; margin-bottom: 10px;">${metaTags.title}</h1>
    <p style="color: #666; margin-bottom: 20px;">${metaTags.description}</p>
    
    <p style="color: #888; font-size: 14px;">
      If you are not redirected automatically, 
      <a href="${metaTags.url}" style="color: #ec4899; text-decoration: none;">click here to continue</a>.
    </p>
  </div>
</body>
</html>`;
} 