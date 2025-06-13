# Perla Accessories E-commerce Platform

A full-stack e-commerce platform for accessories built with Angular and Node.js, optimized for SEO and social media sharing.

## 🚀 Tech Stack

**Frontend:**
- Angular 19 with TypeScript
- TailwindCSS for styling
- Angular SSR (Server-Side Rendering) for SEO
- Dynamic meta tags for social media sharing

**Backend:**
- Node.js with Express
- TypeScript
- MySQL database
- Cloudinary for image storage
- JWT authentication
- Comprehensive security middleware

## 📁 Project Structure

```
perla/
├── client/          # Angular frontend application
├── server/          # Node.js backend API
├── perla_db.sql     # Database schema
└── deployment files
```

## 🔍 SEO & Social Media Features

### ✅ Search Engine Optimization
- **Dynamic Meta Tags**: Automatically generated for each page
- **Open Graph Protocol**: Perfect previews on Facebook, WhatsApp, Instagram
- **Twitter Cards**: Optimized sharing on Twitter
- **Structured Data**: JSON-LD for rich search results
- **XML Sitemap**: Auto-generated for search engines
- **Robots.txt**: Optimized crawling instructions
- **Canonical URLs**: Prevent duplicate content issues

### 📱 Social Media Sharing
When you share any link from your site:
- **Product pages** → Show product image, name, price
- **Category pages** → Show category image and description
- **Homepage** → Show brand image and description

### 🎯 Supported Platforms
- WhatsApp ✅
- Facebook ✅
- Instagram ✅
- Twitter ✅
- LinkedIn ✅
- Pinterest ✅
- Telegram ✅

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- MySQL
- Git

### Setup

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd perla
```

2. **Backend Setup:**
```bash
cd server
npm install
cp env.example .env
# Configure your .env file with your credentials
npm run build
npm run dev
```

3. **Database Setup:**
- Import `perla_db.sql` into your MySQL database
- Update database credentials in server `.env` file

4. **Frontend Setup:**
```bash
cd client
npm install
npm start
```

## 🚀 Deployment

### Frontend (Vercel) - SEO Optimized

1. **Connect to Vercel:**
   - Push code to GitHub
   - Connect your GitHub repository to Vercel
   - Vercel will automatically detect the Angular project

2. **Environment Variables:**
   - No environment variables needed for the frontend

3. **Build Settings:**
   - Framework: Angular
   - Build Command: `cd client && npm ci && npm run build`
   - Output Directory: `client/dist/client/browser`

4. **SEO Configuration:**
   - Sitemap: `https://your-domain.vercel.app/sitemap.xml`
   - Robots.txt: Automatically served from `/public/robots.txt`
   - Meta API: `/api/meta.js` for dynamic meta tags

### Backend (Railway) - Production Ready

1. **Connect to Railway:**
   - Connect your GitHub repository to Railway
   - Select the root directory for deployment

2. **Environment Variables in Railway:**
```
NODE_ENV=production
PORT=3000
DB_HOST=<your_mysql_host>
DB_PORT=3306
DB_USERNAME=<your_db_user>
DB_PASSWORD=<your_db_password>
DB_DATABASE=perla_db
JWT_SECRET=<your_jwt_secret>
FRONTEND_ORIGIN=https://your-vercel-app.vercel.app
MAIL_USER=<your_email>
MAIL_PASSWORD=<your_email_password>
CLOUDINARY_CLOUD_NAME=<your_cloudinary_name>
CLOUDINARY_API_KEY=<your_cloudinary_key>
CLOUDINARY_API_SECRET=<your_cloudinary_secret>
API_URL=https://your-railway-app.railway.app
```

3. **Database Setup:**
   - Create a MySQL database on Railway or use external provider
   - Import the SQL schema from `perla_db.sql`

### Update Production URLs

After deployment, update these files:

1. **client/src/environments/environment.prod.ts:**
```typescript
export const environment = {
  production: true,
  api: 'https://your-railway-app.railway.app',
  withCreds: true,
};
```

## 📈 SEO Optimization Guide

### 1. Google Search Console Setup
```bash
# Add to client/src/index.html
<meta name="google-site-verification" content="YOUR_VERIFICATION_CODE">
```

### 2. Bing Webmaster Tools
```bash
# Add to client/src/index.html
<meta name="msvalidate.01" content="YOUR_BING_VERIFICATION_CODE">
```

### 3. Facebook App ID (Optional)
```bash
# Add to client/src/index.html
<meta property="fb:app_id" content="YOUR_FACEBOOK_APP_ID">
```

### 4. Social Media Handles
Update in `client/src/app/core/services/seo.service.ts`:
```typescript
twitterHandle: '@your_twitter_handle',
```

### 5. Update Social Media Links
Update in `client/src/index.html`:
```json
"sameAs": [
  "https://www.instagram.com/your_instagram",
  "https://www.tiktok.com/@your_tiktok"
]
```

## 🔧 Environment Variables

### Server Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_HOST` | MySQL database host | ✅ |
| `DB_PORT` | MySQL database port | ✅ |
| `DB_USERNAME` | MySQL username | ✅ |
| `DB_PASSWORD` | MySQL password | ✅ |
| `DB_DATABASE` | Database name | ✅ |
| `JWT_SECRET` | Secret for JWT tokens | ✅ |
| `NODE_ENV` | Environment (production/development) | ✅ |
| `PORT` | Server port | ✅ |
| `FRONTEND_ORIGIN` | Frontend URL for CORS | ✅ |
| `MAIL_USER` | Email for notifications | ✅ |
| `MAIL_PASSWORD` | Email password | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |

## 📊 Database Schema

The project includes a complete MySQL database schema with:
- User management and authentication
- Product catalog with categories
- Order management system
- Coupon and discount system
- Review and rating system
- Shipping configuration

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (8+ characters with complexity)
- CORS protection configured for production
- Helmet security headers
- Granular rate limiting with admin bypass
- XSS protection and input sanitization
- SQL injection prevention
- File upload security with extension validation
- CSRF protection (configurable)

## 📱 Features

- Product catalog with categories and search
- Shopping cart functionality
- User authentication and profiles
- Order management system
- Admin dashboard with comprehensive controls
- Coupon and discount system
- Responsive design (mobile-first)
- Image upload and management via Cloudinary
- Email notifications for orders
- Multiple payment methods
- Inventory tracking
- Review and rating system

## 🌟 SEO Best Practices Implemented

### Technical SEO
- ✅ Server-Side Rendering (SSR)
- ✅ Dynamic meta tags
- ✅ Structured data (JSON-LD)
- ✅ XML sitemap
- ✅ Robots.txt optimization
- ✅ Canonical URLs
- ✅ Image optimization
- ✅ Page speed optimization

### Content SEO
- ✅ Descriptive page titles
- ✅ Meta descriptions
- ✅ H1-H6 heading structure
- ✅ Alt text for images
- ✅ Internal linking
- ✅ Breadcrumb navigation

### Social Media SEO
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Pinterest Rich Pins
- ✅ LinkedIn optimization
- ✅ WhatsApp preview optimization

## 🚀 Performance Features

- Lazy loading for components
- Image optimization and compression
- CDN integration (Cloudinary)
- Gzip compression
- Browser caching
- Preloading critical resources
- Code splitting
- Tree shaking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is private and proprietary.

## 📞 Support

For support, email [your-email@domain.com] or create an issue in the repository.

## 🎯 Next Steps for SEO

1. **Submit sitemap to search engines:**
   - Google: https://search.google.com/search-console
   - Bing: https://www.bing.com/webmasters

2. **Set up Google Analytics 4:**
   ```typescript
   // Add to client/src/index.html
   gtag('config', 'GA_MEASUREMENT_ID');
   ```

3. **Monitor SEO performance:**
   - Use Google Search Console
   - Track keyword rankings
   - Monitor social media sharing metrics

4. **Content optimization:**
   - Regular blog posts about accessories and jewelry
   - Product description optimization
   - Category page content enhancement

Your Perla Accessories platform is now **fully optimized for SEO and social media sharing**! 🎉 