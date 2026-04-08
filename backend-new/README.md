# Shreeraj Corporation Backend

Custom Node.js + MongoDB backend for Shreeraj Corporation website.

## Setup Instructions

### 1. Install MongoDB

Download and install MongoDB from: https://www.mongodb.com/try/download/community

Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### 2. Install Dependencies

```bash
cd backend-new
npm install
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update the values:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shreeraj-db
JWT_SECRET=your-secret-key-change-this-in-production
NODE_ENV=development
```

### 4. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

### 5. Create Admin User

Use Postman or curl to create the first admin user:

```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@shreeraj.com",
  "password": "admin123",
  "role": "admin"
}
```

### 6. Update Frontend API URL

Update `frontend/src/services/api.js`:

```javascript
const API_URL = 'http://localhost:5000/api';
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user (protected)

### Categories
- GET `/api/categories` - Get all categories
- GET `/api/categories?populate=products` - Get categories with products
- GET `/api/categories/:id` - Get single category
- POST `/api/categories` - Create category (protected)
- PUT `/api/categories/:id` - Update category (protected)
- DELETE `/api/categories/:id` - Delete category (admin only)

### Products
- GET `/api/products` - Get all products
- GET `/api/products?category=:categoryId` - Get products by category
- GET `/api/products/:id` - Get single product
- POST `/api/products` - Create product (protected, with file upload)
- PUT `/api/products/:id` - Update product (protected, with file upload)
- DELETE `/api/products/:id` - Delete product (admin only)

### Catalogues
- GET `/api/catalogues` - Get all catalogues
- GET `/api/catalogues/:id` - Get single catalogue
- POST `/api/catalogues` - Create catalogue (protected, with file upload)
- PUT `/api/catalogues/:id` - Update catalogue (protected, with file upload)
- DELETE `/api/catalogues/:id` - Delete catalogue (admin only)

## File Uploads

Files are stored in the `uploads/` directory and served at `/uploads/:filename`

Supported file types:
- Images: JPEG, JPG, PNG, GIF
- Documents: PDF

Max file size: 10MB
