# Backend API Server

## Overview
Main RESTful API server for the Inventory Management System.
- Built with Node.js + Express
- MongoDB integration with Mongoose
- JWT-based authentication
- Role-based authorization

## Folder Structure

```
backend/
├── server.js              # Main server file
├── package.json           # Dependencies
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   └── adminMiddleware.js # Admin-only routes
├── controllers/           # Business logic
│   ├── authController.js
│   ├── inventoryController.js
│   ├── categoryController.js
│   ├── unitController.js
│   └── userController.js
└── routes/               # API endpoints
    ├── auth.js
    ├── inventory.js
    ├── category.js
    ├── unit.js
    └── user.js
```

## Setup

```bash
cd backend
npm install
npm run dev  # Development with nodemon
```

Server runs on `http://localhost:5000`

## Environment Variables

Create `.env` in project root:
```
MONGODB_URI=mongodb://localhost:27017/inventory_system
JWT_SECRET=your-secret-key
PORT=5000
CLIENT_URL=http://localhost:8080
NODE_ENV=development
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Inventory
- `GET /api/inventory` - List items (with pagination, search, filter)
- `GET /api/inventory/:id` - Get item details
- `GET /api/inventory/stats` - Get statistics
- `GET /api/inventory/low-stock` - Get low-stock items
- `POST /api/inventory` - Create item (admin)
- `PUT /api/inventory/:id` - Update item (admin)
- `DELETE /api/inventory/:id` - Delete item (admin)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create (admin)
- `PUT /api/categories/:id` - Update (admin)
- `DELETE /api/categories/:id` - Delete (admin)

### Units
- `GET /api/units` - Get all units
- `POST /api/units` - Create (admin)
- `PUT /api/units/:id` - Update (admin)
- `DELETE /api/units/:id` - Delete (admin)

### Users (Admin only)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Change user role
- `PUT /api/users/:id/toggle-status` - Toggle active status
- `DELETE /api/users/:id` - Delete user

## Authentication

All endpoints except `/auth/register` and `/auth/login` require:
```
Authorization: Bearer <token>
```

Tokens expire after 24 hours.

## Error Responses

```json
{
  "error": "Error message"
}
```

Status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not found
- `500` - Server error

## Testing

Use Postman or Insomnia to test:

1. Login
```
POST http://localhost:5000/api/auth/login
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

2. Use returned token in Authorization header

3. Test other endpoints

## Development Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- JWT tokens include userId, email, and role
- Inventory status updates automatically based on quantity
- All timestamps use ISO 8601 format
- MongoDB ObjectIds are used for relationships

## MongoDB Indexes

For better performance, ensure these indexes are created:

```javascript
db.users.createIndex({ "email": 1 }, { unique: true })
db.inventory.createIndex({ "name": 1 })
db.inventory.createIndex({ "category": 1 })
db.categories.createIndex({ "name": 1 }, { unique: true })
db.units.createIndex({ "name": 1 }, { unique: true })
```

## Scripts

```bash
npm run dev    # Development mode with hot reload
npm start      # Production mode
npm test       # Run tests (if configured)
```

## Troubleshooting

### Connection refused
- Ensure MongoDB is running
- Check MONGODB_URI in .env

### Invalid token
- Clear localStorage and login again
- Check JWT_SECRET matches in all services

### CORS errors
- Ensure CLIENT_URL in .env matches frontend URL
- Check CORS middleware configuration

For more details, see the main [README.md](../README.md)
