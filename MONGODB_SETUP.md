# MongoDB Atlas Setup Instructions

## Current Issue
Your MongoDB Atlas cluster is not allowing connections from your current IP address.

## Solutions

### Option 1: Add your IP to Atlas (Recommended for production)
1. Go to https://cloud.mongodb.com
2. Log into your account
3. Navigate to your cluster
4. Click "Network Access" in the left sidebar
5. Click "Add IP Address"
6. Click "Add Current IP Address" 
7. Or manually add your IP address

### Option 2: Allow all IPs (Development only)
1. In Network Access, click "Add IP Address"
2. Select "Allow access from anywhere"
3. This adds 0.0.0.0/0 to your whitelist

### Option 3: Use Local MongoDB (Temporary)
If you want to test locally first, I can help you set up a local MongoDB instance.

## Your Connection Details
- Username: creatersmx0121_db_user
- Password: xgTkZ0lNEql5hJlv
- Cluster: cluster0.h8j9olx.mongodb.net

## Current Backend Port: 5001
## Current Frontend Port: 5173

Both servers are running, but the backend can't connect to MongoDB Atlas due to IP whitelist restrictions.