# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Verify your email

## Step 2: Create a Cluster

1. After logging in, click "Build a Database"
2. Choose "M0 FREE" tier (Free forever)
3. Select a cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region closest to you (e.g., Mumbai for India)
5. Give your cluster a name (e.g., "shreeraj-cluster")
6. Click "Create Cluster" (takes 3-5 minutes)

## Step 3: Create Database User

1. Click "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `shreeraj_admin`
5. Password: Click "Autogenerate Secure Password" and SAVE IT
6. Database User Privileges: Select "Atlas admin"
7. Click "Add User"

## Step 4: Configure Network Access

1. Click "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - This adds `0.0.0.0/0` to the IP whitelist
4. Click "Confirm"

## Step 5: Get Connection String

1. Click "Database" in the left sidebar
2. Click "Connect" button on your cluster
3. Choose "Connect your application"
4. Driver: Node.js
5. Version: 5.5 or later
6. Copy the connection string (looks like):
   ```
   mongodb+srv://shreeraj_admin:<password>@shreeraj-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
7. Replace `<password>` with your actual password
8. Add database name before the `?`:
   ```
   mongodb+srv://shreeraj_admin:YOUR_PASSWORD@shreeraj-cluster.xxxxx.mongodb.net/shreeraj-db?retryWrites=true&w=majority
   ```

## Step 6: Update .env File

Open `backend-new/.env` and update:

```env
PORT=5000
MONGODB_URI=mongodb+srv://shreeraj_admin:YOUR_PASSWORD@shreeraj-cluster.xxxxx.mongodb.net/shreeraj-db?retryWrites=true&w=majority
JWT_SECRET=shreeraj-secret-key-2024
NODE_ENV=development
```

## Step 7: Start the Server

```bash
cd backend-new
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB connected successfully
```

## Step 8: Create Admin User

Use Postman, Thunder Client, or curl:

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

## Troubleshooting

### Error: "MongoServerError: bad auth"
- Check your username and password in the connection string
- Make sure you replaced `<password>` with actual password
- Password should be URL encoded if it contains special characters

### Error: "MongooseServerSelectionError"
- Check your IP is whitelisted in Network Access
- Make sure you have internet connection
- Try "Allow Access from Anywhere" (0.0.0.0/0)

### Error: "Cannot find module"
- Run `npm install` in backend-new folder

## Next Steps

After successful setup:
1. Create categories via API
2. Create products via API
3. Upload catalogues via API
4. Build admin panel UI (optional)
