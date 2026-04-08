# Bulk Upload Products Guide

## Problem: 4000+ Images with MongoDB Atlas Free Tier

MongoDB Atlas free tier (M0) has only **512MB storage**, which is NOT enough for 4000+ images.

## Solutions:

### ⭐ RECOMMENDED: Use Cloudinary (FREE)

Cloudinary offers:
- **25GB free storage**
- **25GB bandwidth/month**
- **Automatic image optimization**
- **CDN delivery** (fast worldwide)
- **Easy integration**

#### Setup Cloudinary:

1. **Sign up**: https://cloudinary.com/users/register/free
2. **Get credentials** from dashboard
3. **Install package**:
```bash
cd backend-new
npm install cloudinary multer-storage-cloudinary
```

4. **Update `.env`**:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

5. **I'll create the Cloudinary integration** - just provide your credentials!

---

### Option 2: Bulk Upload from Folder Structure

If you want to store images locally on your server:

#### 1. Organize your images:

```
products/
  ├── Weaving Spares/
  │   ├── rapier-tape.jpg
  │   ├── bearing-cover.jpg
  │   └── ...
  ├── Processing Spares/
  │   ├── motor-pulley.jpg
  │   └── ...
  └── Textile Machinery/
      └── ...
```

#### 2. Run bulk upload:

```bash
cd backend-new
node scripts/bulkUploadProducts.js folder "C:\path\to\products"
```

---

### Option 3: Bulk Upload from CSV

#### 1. Create CSV file (`products.csv`):

```csv
name,category,image_path,description
Rapier Tape,Weaving Spares,C:\images\rapier-tape.jpg,High-quality rapier tape
Bearing Cover,Weaving Spares,C:\images\bearing-cover.jpg,Durable bearing cover
Motor Pulley,Processing Spares,C:\images\motor-pulley.jpg,Industrial motor pulley
```

#### 2. Run import:

```bash
cd backend-new
node scripts/bulkUploadProducts.js csv "C:\path\to\products.csv"
```

---

## Storage Comparison:

| Solution | Storage | Cost | Speed | Recommended |
|----------|---------|------|-------|-------------|
| **Cloudinary** | 25GB | FREE | Fast (CDN) | ✅ YES |
| **AWS S3** | Unlimited | ~$0.023/GB | Fast | ✅ YES |
| **Local Server** | Depends | FREE | Slow | ⚠️ OK |
| **MongoDB Atlas** | 512MB | FREE | Slow | ❌ NO |

---

## Next Steps:

**Choose one:**

1. **Use Cloudinary** (Recommended)
   - I'll integrate it for you
   - Just sign up and provide credentials

2. **Use local storage**
   - Organize images in folders
   - Run bulk upload script

3. **Use AWS S3**
   - I'll help you set it up
   - Very cheap and scalable

**Which option do you prefer?**
