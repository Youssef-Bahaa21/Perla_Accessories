# Perla Accessories E-commerce Platform

A full-stack e-commerce platform for accessories built with Angular and Node.js.

## 🚀 Tech Stack

**Frontend:**
- Angular 19 with TypeScript
- TailwindCSS for styling
- Angular SSR (Server-Side Rendering)

**Backend:**
- Node.js with Express
- TypeScript
- MySQL database
- Cloudinary for image storage
- JWT authentication

## 📁 Project Structure

```
perla/
├── client/          # Angular frontend application
├── server/          # Node.js backend API
├── perla_db.sql     # Database schema
└── deployment files
```

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

### Frontend (Vercel)

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

### Backend (Railway)

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

- JWT authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Rate limiting
- XSS protection
- SQL injection prevention

## 📱 Features

- Product catalog with categories
- Shopping cart functionality
- User authentication and profiles
- Order management
- Admin dashboard
- Coupon system
- Responsive design
- Image upload and management

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