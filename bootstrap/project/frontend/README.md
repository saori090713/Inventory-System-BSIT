# User Frontend

## Overview
User-facing application for browsing products and inventory.
- User authentication (login/register)
- Product browsing
- Search and filter
- Inventory statistics
- Product details view

## Folder Structure

```
frontend/
├── pages/                   # HTML pages
│   ├── login.html          # Login/Register page
│   └── products.html       # Product listing
├── js/                     # JavaScript logic
│   ├── api.js              # API service
│   ├── auth.js             # Authentication logic
│   └── products.js         # Products page logic
├── css/                    # Styles
│   ├── auth.css            # Login/Auth styles
│   └── main.css            # Product page styles
├── assets/                 # Images, icons, etc.
└── package.json
```

## Setup

```bash
cd frontend
npm install
npm run dev
```

Opens on `http://localhost:8080`

## Features

### Authentication
- User registration
- Login with email/password
- Session management
- Automatic role detection

### Products Page
- View all inventory items
- Search products
- View product statistics
  - Total products
  - In stock count
  - Low stock count
  - Out of stock count
- Click for product details
- Status badges (In Stock, Low Stock, Out of Stock)

### Product Details
- View full product information
- Category and unit details
- Stock status
- Price and quantity
- Low-stock warnings

## User Workflow

### 1. First Time User
1. Click "Create Account" on login page
2. Enter email, password, name
3. Account created as regular user
4. Automatically logged in
5. Redirected to products page

### 2. Returning User
1. Enter email and password
2. Click "Login"
3. Redirected to products page

### 3. Browse Products
1. View product grid
2. Use search box to find items
3. See stock status badges
4. Click "View Details" for more info

## Components

### Login Page (`pages/login.html`)
- Combined login/register form
- Toggle between login and register modes
- Form validation
- Error/success messages

### Products Page (`pages/products.html`)
- Product grid layout
- Statistics cards
- Search functionality
- Product detail modal
- Bootstrap 5 responsive design

### API Service (`js/api.js`)
- Centralized API communication
- Token management
- Error handling
- Automatic logout on 401

### Authentication (`js/auth.js`)
- Login/register handlers
- Token storage
- User info management
- Redirect logic

### Products (`js/products.js`)
- Load products from API
- Search functionality
- Statistics loading
- Modal interactions

## Styling

- Bootstrap 5 for responsive layout
- Custom CSS for theming
- Mobile-first approach
- Gradient backgrounds
- Smooth transitions

## Backend Integration

Requires backend API running on `http://localhost:5000`

Endpoints used:
- POST /api/auth/register
- POST /api/auth/login
- GET /api/inventory
- GET /api/inventory/:id
- GET /api/inventory/stats

## Default Test Account

Email: `user@example.com`
Password: `user123`

## Storage

Uses localStorage for:
- `authToken` - JWT authentication token
- `user` - User object (email, role, name)

## Common Issues

### Page not loading
- Check backend is running
- Verify API URL in js/api.js
- Check JavaScript console for errors

### Login not working
- Verify backend is running
- Check credentials
- Clear browser cache
- Check network tab

### Products not showing
- Ensure logged in
- Check backend API
- Verify database has data
- Check browser console

## Scripts

```bash
npm run dev    # Start development server
```

## Features for Future Enhancement

- Product reviews and ratings
- Wishlist functionality
- Order management
- Price history tracking
- Export to CSV/PDF
- Advanced filtering
- User preferences

For more details, see the main [README.md](../README.md)
