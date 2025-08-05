# Deployment Guide for Rizeos Job Portal

This guide will help you deploy both the frontend and backend of the Rizeos Job Portal on Render.

## Prerequisites

1. **MongoDB Database**: You'll need a MongoDB database. You can use:
   - MongoDB Atlas (recommended for production)
   - Render's MongoDB service
   - Any other MongoDB provider

2. **OpenAI API Key**: For AI features, you'll need an OpenAI API key

3. **Render Account**: Sign up at [render.com](https://render.com)

## Backend Deployment

### Step 1: Prepare Backend Environment Variables

Create the following environment variables in your Render backend service:

```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/rizeos
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRE=7d
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://your-frontend-app-name.onrender.com
OPENAI_API_KEY=your-openai-api-key
MAX_FILE_SIZE=10485760
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2: Deploy Backend on Render

1. **Connect your GitHub repository** to Render
2. **Create a new Web Service**:
   - **Name**: `rizeos-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

3. **Add Environment Variables** as listed above

4. **Deploy**: Click "Create Web Service"

### Step 3: Get Backend URL

After deployment, note your backend URL (e.g., `https://rizeos-backend.onrender.com`)

## Frontend Deployment

### Step 1: Prepare Frontend Environment Variables

Create the following environment variable in your Render frontend service:

```
VITE_API_URL=https://your-backend-app-name.onrender.com/api
```

### Step 2: Deploy Frontend on Render

1. **Create a new Static Site**:
   - **Name**: `rizeos-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free (or paid for production)

2. **Add Environment Variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-app-name.onrender.com/api`

3. **Deploy**: Click "Create Static Site"

## Configuration Files

### Backend Configuration

The backend is already configured with:
- ✅ `render.yaml` for Render deployment
- ✅ `env.example` showing required environment variables
- ✅ Production-ready server configuration
- ✅ CORS configuration for frontend integration

### Frontend Configuration

The frontend has been updated with:
- ✅ Centralized axios configuration (`src/config/axios.ts`)
- ✅ Environment variable support for API URL
- ✅ Updated Vite configuration
- ✅ `render.yaml` for Render deployment
- ✅ `env.example` showing required environment variables

## Environment Variables Reference

### Backend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/rizeos` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secure-secret-key` |
| `JWT_EXPIRE` | JWT token expiration | `7d` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port | `10000` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://rizeos-frontend.onrender.com` |
| `OPENAI_API_KEY` | OpenAI API key for AI features | `sk-...` |
| `MAX_FILE_SIZE` | Maximum file upload size | `10485760` |

### Frontend Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `https://rizeos-backend.onrender.com/api` |

## Deployment Checklist

### Backend Checklist
- [ ] MongoDB database created and accessible
- [ ] Environment variables configured in Render
- [ ] Backend service deployed successfully
- [ ] Backend URL noted for frontend configuration
- [ ] API endpoints responding correctly

### Frontend Checklist
- [ ] Backend URL configured in frontend environment variables
- [ ] Frontend service deployed successfully
- [ ] Frontend accessible via Render URL
- [ ] API calls working from frontend to backend
- [ ] Authentication working properly

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend environment variables

2. **API Connection Issues**: Verify `VITE_API_URL` is correctly set in frontend environment variables

3. **Database Connection**: Check MongoDB URI format and network access

4. **Build Failures**: Ensure all dependencies are in `package.json`

5. **Environment Variables**: Double-check all environment variables are set correctly

### Debug Steps

1. Check Render logs for both services
2. Verify environment variables are set correctly
3. Test API endpoints directly
4. Check browser console for frontend errors
5. Verify MongoDB connection

## Production Considerations

1. **Database**: Use MongoDB Atlas for production
2. **Security**: Use strong JWT secrets and HTTPS
3. **Monitoring**: Set up logging and monitoring
4. **Backup**: Regular database backups
5. **SSL**: Ensure HTTPS is enabled
6. **Rate Limiting**: Already configured in backend

## Support

If you encounter issues:
1. Check Render documentation
2. Review application logs
3. Verify environment variables
4. Test locally first
5. Check network connectivity

## Local Development

To test locally before deployment:

1. **Backend**: `cd backend && npm install && npm run dev`
2. **Frontend**: `cd frontend && npm install && npm run dev`
3. **Environment**: Copy `env.example` to `.env` and configure

## File Structure After Deployment

```
Rizeos/
├── backend/
│   ├── render.yaml          # Render configuration
│   ├── env.example          # Environment variables template
│   ├── package.json         # Dependencies
│   └── server.js           # Production server
├── frontend/
│   ├── render.yaml          # Render configuration
│   ├── env.example          # Environment variables template
│   ├── package.json         # Dependencies
│   ├── vite.config.ts       # Updated Vite config
│   └── src/
│       └── config/
│           └── axios.ts     # Centralized API configuration
└── DEPLOYMENT_GUIDE.md     # This guide
```

Your project is now ready for deployment on Render! 