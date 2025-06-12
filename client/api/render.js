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
  
  <!-- Redirect to actual site for real users -->
  <script>
    // Only redirect if not a bot
    if (typeof navigator !== 'undefined' && !/(facebook|whatsapp|twitter|telegram|skype|slack|discord|google|bing)bot/i.test(navigator.userAgent)) {
      window.location.href = '${metaTags.url}';
    }
  </script>
</head>
<body>
  <h1>${metaTags.title}</h1>
  <p>${metaTags.description}</p>
  <img src="${metaTags.image}" alt="${metaTags.title}" style="max-width: 100%; height: auto;">
  
  <p>If you are not redirected automatically, <a href="${metaTags.url}">click here</a>.</p>
</body>
</html>`;
} 