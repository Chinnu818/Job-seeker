# Port Configuration

## Development Ports

### Backend Server
- **Port**: 5000
- **URL**: http://localhost:5000
- **API Base**: http://localhost:5000/api

### Frontend Server
- **Port**: 3000
- **URL**: http://localhost:3000

## Environment Variables

### Backend (.env)
```bash
PORT=5000
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```bash
VITE_API_URL=http://localhost:5000/api
```

## Starting the Application

### Option 1: Using the startup script
```bash
npm run start-dev
```

### Option 2: Using concurrently
```bash
npm run dev
```

### Option 3: Starting servers separately
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

## CORS Configuration

The backend is configured to allow requests from:
- http://localhost:3000
- http://127.0.0.1:3000

## Troubleshooting

If you encounter port conflicts:
1. Check if ports 3000 and 5000 are available
2. Kill any existing processes on these ports
3. Restart the development servers

To check port usage:
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :3000
lsof -i :5000
``` 