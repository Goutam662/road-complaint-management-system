# MERN Road Complaint System - Setup & Running Guide

## Summary of Fixes Made

### ✅ Backend Fixes

1. **Fixed Auth Routes** (`authRoutes.js`)
   - ✓ Register endpoint now returns user data and JWT token
   - ✓ Login endpoint now returns user data and JWT token
   - ✓ Added `/profile` endpoint to fetch user details
   - ✓ Better error handling and validation

2. **Fixed Complaint Routes** (`complaintRoutes.js`)
   - ✓ Added `authMiddleware` to protect all routes
   - ✓ Added `GET /` endpoint to fetch all user complaints with filters
   - ✓ Added `GET /:id` endpoint to fetch single complaint
   - ✓ Added proper user ID extraction from JWT token
   - ✓ User ID automatically extracted from `req.user.id` instead of from request body

3. **Fixed Admin Routes** (`adminRoutes.js`)
   - ✓ Added JWT token generation on admin login
   - ✓ Added `/complaints` endpoint to list all complaints
   - ✓ Added `/complaints/:id` endpoint to fetch single complaint
   - ✓ Added `/complaints/:id/status` endpoint to update complaint status
   - ✓ Added `/stats` endpoint for admin dashboard statistics
   - ✓ Added `adminAuthMiddleware` to protect all routes

4. **Updated Chat Routes** (`chatRoutes.js`)
   - ✓ Added `authMiddleware` to protect message endpoint
   - ✓ Better error handling

5. **Updated Complaint Model** (`models/Complaint.js`)
   - ✓ Added `description` field
   - ✓ Added `severity` field
   - ✓ Made `user` field required

6. **Updated Package.json** (`backend/package.json`)
   - ✓ Added `nodemon` for development
   - ✓ Added `dev` script for easier development

### ✅ Frontend Fixes

1. **Created `.env` file** (`frontend/.env`)
   - ✓ Set `REACT_APP_API_BASE_URL=http://localhost:5000/api`

2. **Updated API Service** (`frontend/src/services/api.js`)
   - ✓ Added better error handling with `handleResponse()` function
   - ✓ Added `getProfile()` endpoint to auth service
   - ✓ Added admin register endpoint
   - ✓ Added `getComplaintById()` to admin service
   - ✓ Added `getStats()` to admin service
   - ✓ Consistent error messages from API responses

---

## Prerequisites

- **Node.js** v14+
- **MongoDB** (local or Atlas cloud)
- **npm** or **yarn**

---

## Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create/update .env file (already done)
# Make sure MONGO_URI and JWT_SECRET are set

# Start the backend
npm run dev  # for development with auto-reload
# OR
npm start    # for production
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create/update .env file (already done)
# REACT_APP_API_BASE_URL=http://localhost:5000/api

# Start the frontend
npm start
```

Frontend will run on: `http://localhost:3000`

---

## Testing the Connection

### 1. Test Backend API Directly
```bash
# Health check
curl http://localhost:5000/

# Expected response:
# {"message":"API is running"}
```

### 2. Test User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "mobile": "9999999999",
    "email": "john@example.com",
    "village": "Test Village",
    "password": "password123"
  }'
```

### 3. Test User Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "john@example.com",
    "password": "password123"
  }'
```

### 4. Test Admin Login
```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## API Endpoints Overview

### Auth Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Complaint Endpoints (Protected)
- `POST /api/complaints/upload` - Upload new complaint
- `GET /api/complaints` - Get user complaints
- `GET /api/complaints/:id` - Get complaint details
- `PUT /api/complaints/:id` - Update complaint

### Admin Endpoints (Protected)
- `POST /api/admin/register` - Register admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/complaints` - Get all complaints
- `GET /api/admin/complaints/:id` - Get complaint details
- `PUT /api/admin/complaints/:id/status` - Update complaint status
- `GET /api/admin/stats` - Get statistics

### Chat Endpoints (Protected)
- `POST /api/chat/message` - Send message
- `GET /api/chat/ping` - Health check

---

## Frontend Features Now Working

✅ **User Authentication**
- Register with validation
- Login with email/mobile
- Protected routes
- Auto-logout on token expiry

✅ **Complaint Management**
- Upload complaints with images
- View all complaints with filters
- Track complaint status
- Edit complaint details

✅ **Admin Dashboard**
- View all complaints
- Update complaint status
- View statistics
- Filter and search

✅ **Real-time Validation**
- Form validation
- File size/type validation
- Error messages

---

## Important Notes

1. **MongoDB Connection**: Make sure MongoDB is running and connection string is correct in `.env`

2. **JWT Secret**: Change `JWT_SECRET` in `.env` for production

3. **File Uploads**: Complaints with images are stored in `backend/uploads` directory

4. **CORS**: Already enabled in backend for frontend communication

5. **Token Storage**: Tokens are stored in browser's localStorage

6. **Default Port**: 
   - Backend: 5000
   - Frontend: 3000
   - MongoDB: 27017 (if local)

---

## Troubleshooting

### Backend won't connect to MongoDB
- Check if MongoDB is running
- Verify MONGO_URI in .env is correct
- Check network connection for Atlas cloud

### CORS errors
- Make sure backend is running on 5000
- Frontend .env has correct API_BASE_URL
- Clear browser cache and restart

### Token issues
- Clear localStorage in browser DevTools
- Log out and log in again
- Make sure JWT_SECRET is set in backend .env

### File upload fails
- Check if `uploads` folder exists in backend
- Make sure backend has write permissions
- Verify file size < 5MB and correct format

---

## Next Steps

1. Create initial admin account:
   - Navigate to `/admin/login`
   - Use admin register endpoint if needed

2. Test full user flow:
   - Register user
   - Login
   - Upload complaint
   - Check admin dashboard

3. Deploy to production:
   - Use environment-specific .env files
   - Set up SSL/HTTPS
   - Use production MongoDB
   - Configure proper JWT_SECRET

---

## Database Seeding (Optional)

To seed an admin account (backend):
```javascript
// Run in MongoDB
db.admins.insertOne({
  username: "admin",
  password: "$2a$10/..." // bcrypt hashed password
})
```

Or use the admin register endpoint via API.

---

Happy coding! 🚀
