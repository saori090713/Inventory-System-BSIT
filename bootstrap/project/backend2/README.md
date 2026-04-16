# Authentication Microservice (backend2)

## Overview
Separate authentication service for token verification and management.
- JWT verification
- Token refresh
- Login/logout logging
- Independent scalability

## Folder Structure

```
backend2/
├── server.js              # Main service file
├── package.json           # Dependencies
└── middleware/
    └── authMiddleware.js  # JWT verification
```

## Setup

```bash
cd backend2
npm install
npm run dev  # Development mode
```

Service runs on `http://localhost:5001`

## Environment Variables

Uses same `.env` from main project:
```
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
PORT=5001
```

## Endpoints

### Token Verification
```
POST /api/auth-service/verify
{
  "token": "<jwt_token>"
}

Response:
{
  "valid": true,
  "user": {
    "userId": "...",
    "email": "...",
    "role": "..."
  }
}
```

### Token Refresh
```
POST /api/auth-service/refresh
{
  "refreshToken": "<refresh_token>"
}

Response:
{
  "token": "<new_jwt_token>"
}
```

### Login Logging
```
POST /api/auth-service/log-login
{
  "userId": "...",
  "email": "...",
  "timestamp": "..."
}

Response:
{
  "message": "Login logged successfully"
}
```

### Logout Logging
```
POST /api/auth-service/logout
{
  "userId": "...",
  "email": "..."
}

Response:
{
  "message": "Logout successful"
}
```

### Health Check
```
GET /api/auth-service/health

Response:
{
  "status": "Authentication Service is running"
}
```

## Integration

Called by:
- Main backend for token verification
- Frontend for token refresh
- Backend for user session logging

## Scripts

```bash
npm run dev    # Development mode with hot reload
npm start      # Production mode
```

## Security Notes

- Tokens are verified using JWT_SECRET
- Refresh tokens use JWT_REFRESH_SECRET
- All requests logged
- No sensitive data returned

For more details, see the main [README.md](../README.md)
