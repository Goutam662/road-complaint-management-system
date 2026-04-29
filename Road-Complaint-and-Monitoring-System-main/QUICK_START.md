# 🚀 Quick Start Guide

## Start Everything in Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend (in another terminal):**
```bash
cd frontend
npm install
```

### Step 2: Configure MongoDB
Make sure MongoDB is running. The `.env` file already has the connection string configured.

If using local MongoDB:
```bash
# On Windows
mongod

# On macOS/Linux
brew services start mongodb-community
# OR
mongod --config /usr/local/etc/mongod.conf
```

### Step 3: Start Backend

```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
MongoDB Connected
```

### Step 4: Start Frontend (new terminal)

```bash
cd frontend
npm start
```

This will open `http://localhost:3000` in your browser.

---

## 🧪 Test the Full Flow

### 1. User Registration & Login
1. Go to http://localhost:3000/register
2. Fill in the form with:
   - Name: John Doe
   - Mobile: 9999999999
   - Email: john@example.com
   - Village: Test Village
   - Password: password123
3. Click Register
4. You should be redirected to Dashboard

### 2. Submit a Complaint
1. Click "Submit New Complaint" or go to /upload
2. Select an image
3. Enter location: "Main Road near School"
4. Description: "Huge pothole on the road"
5. Severity: High
6. Click Submit
7. Check Dashboard to see your complaint

### 3. Admin Dashboard
1. Go to http://localhost:3000/admin/login
2. Before logging in you must create the first administrator account. You can
   either use the registration API or call `/admin/create-admin` directly:

```bash
curl -X POST http://localhost:5000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

   The endpoint is open only if no admins exist; after the first admin is
   created, further calls require a valid admin token.

3. Then login with:
   - Username: admin
   - Password: admin123

   Once logged in, you can also create additional admins from the dashboard.

4. View all complaints and update their status

---

## 📊 API Health Check

```bash
# Check if backend is running
curl http://localhost:5000/

# Response:
# {"message":"API is running"}
```

---

## 📂 Project Structure After Setup

```
road_project_mern/
├── backend/
│   ├── config/
│   │   └── db.js          # MongoDB connection
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   ├── Admin.js
│   │   └── ...
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── complaintRoutes.js
│   │   ├── adminRoutes.js
│   │   └── chatRoutes.js
│   ├── uploads/           # Uploaded images
│   ├── .env              # Already configured
│   ├── server.js         # Main server file
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── services/
│   │   │   └── api.js    # All API calls
│   │   ├── styles/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── .env             # Already configured
│   ├── package.json
│   └── public/
│
└── SETUP_GUIDE.md       # Detailed setup guide

```

---

## 🔧 Common Issues & Solutions

### MongoDB Connection Failed
**Solution:**
- Ensure MongoDB is running
- Check if `MONGO_URI` in `backend/.env` is correct
- Try connecting to MongoDB Compass to verify connection

### CORS Error
**Solution:**
- Make sure backend is running on port 5000
- Frontend .env has `REACT_APP_API_BASE_URL=http://localhost:5000/api`
- Clear browser cache: Ctrl+Shift+Delete → Clear browsing data

### Port Already in Use
**Solution:**
```bash
# Kill process on port 5000 (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000 (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Token Expired/Invalid
**Solution:**
- Open DevTools (F12) → Application → Local Storage
- Clear all data
- Log out and log in again

---

## 📝 What's Connected Now

✅ **User Authentication**
- Register endpoint returns user + token
- Login endpoint returns user + token
- Tokens stored in localStorage
- Protected routes check authentication

✅ **Complaint Upload**
- Authenticated users can upload complaints
- Images saved to backend/uploads
- User ID extracted from JWT token
- Complaints linked to users automatically

✅ **Dashboard**
- Fetches user's complaints from backend
- Displays with filters (status, location)
- Shows complaint details

✅ **Admin Panel**
- Admin login with JWT
- View all complaints
- Update complaint status
- View statistics

✅ **Chat Service**
- Protected message endpoint
- Ready for WebSocket integration

---

## 🎯 Next Steps

1. **Optional: Add More Features**
   - Email notifications
   - Real-time updates with WebSockets
   - Image gallery support
   - Location map integration

2. **Optional: Deployment**
   - Deploy backend to Heroku/Railway/Render
   - Deploy frontend to Vercel/Netlify
   - Setup production MongoDB Atlas

3. **Optional: Improvements**
   - Add refresh token
   - Implement 2FA
   - Add file validation
   - Better error messages

---

## 💡 Pro Tips

1. Use **Postman** or **Insomnia** to test API endpoints
2. Check **browser DevTools** (F12) for network requests
3. Check **backend console** for error logs
4. Use **MongoDB Compass** to view data
5. Keep terminal windows visible while developing

---

## ✅ Everything is Properly Connected!

Your MERN application is now fully integrated with:
- ✅ User authentication (register, login, protected routes)
- ✅ Complaint submission with image upload
- ✅ Admin dashboard for managing complaints
- ✅ JWT-based security
- ✅ MongoDB database connection
- ✅ API error handling
- ✅ Frontend validation

Happy coding! 🎉
