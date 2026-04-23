# Inventory Management System

**BSIT 2B**

### Contributors:
- Christian Bero
- Melchor Peralta
- Micke Tuzon
- Elizer Torres
- Marjune Banayos

---

A full-stack web application for managing inventory items, categories, and units with role-based access control.

## 📋 Overview

This project is a modern inventory management system built with:
- **Backend**: Node.js + Express + MySQL (Sequelize ORM)
- **Frontend**: HTML5 + JavaScript + Bootstrap
- **Authentication**: JWT-based with role-based authorization (Admin/User)
- **Database**: MySQL with automatic migrations and seeding

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+)
- npm or yarn
- MySQL Server (v5.7+)

### Installation

1. **Clone/Extract Project**
   ```bash
   cd project
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd frontend
   npm install
   cd ..
   ```

4. **Setup Environment Variables**
   ```bash
   # Copy environment template
   cp .env.example .env
   
   # Edit .env with your database credentials
   # Windows users: Use your favorite text editor or:
   # notepad .env
   ```

5. **Create Database**
   ```bash
   # Create a new MySQL database named 'inventory_db'
   # Using MySQL CLI:
   mysql -u root -p -e "CREATE DATABASE inventory_db;"
   ```

6. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   # Server will run on http://localhost:5000
   ```

7. **Start Frontend Server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   # Server will run on http://localhost:8080
   ```

8. **Access Application**
   - Open browser: `http://localhost:8080/frontend/pages/login.html`
   - Default Admin Credentials:
     - Username: `admin`
     - Password: `admin123`

## 📁 Project Structure

```
project/
├── backend/                 # Backend API server
│   ├── server.js           # Express app setup
│   ├── package.json        # Dependencies
│   ├── controllers/        # Business logic
│   ├── models/             # Database models
│   ├── routes/             # API endpoints
│   └── middleware/         # Auth & validation
├── frontend/               # Frontend application
│   ├── pages/             # HTML pages
│   │   ├── login.html     # Login/Register page
│   │   ├── dashboard.html # Admin dashboard
│   │   └── products.html  # Products listing
│   ├── js/                # JavaScript files
│   │   ├── js/           # Main JS modules
│   │   │   ├── api.js    # API client
│   │   │   ├── main.js   # UI utilities
│   │   │   ├── dashboard.js
│   │   │   └── login.js
│   │   └── bootstrap files
│   └── css/               # Stylesheets
│       ├── bootstrap.min.css
│       ├── auth.css       # Auth page styles
│       └── main.css       # Main app styles
├── db/                    # Database files
│   └── seeds/
│       └── seedDatabase.js # Sample data
├── .env.example           # Environment template
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

## 🔐 Authentication

The system uses **JWT (JSON Web Tokens)** for authentication:
- Tokens expire after 24 hours
- Include token in `Authorization: Bearer <token>` header for protected endpoints
- Admin users can manage users, categories, and units
- Regular users can only view inventory

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token
- `GET /api/auth/users/list` - Get all active users (public)

### Inventory (Paginated)
- `GET /api/inventory` - List all items (search, filter, paginate)
- `GET /api/inventory/:id` - Get item details
- `GET /api/inventory/stats` - Get inventory statistics
- `GET /api/inventory/low-stock` - Get low-stock items
- `POST /api/inventory` - Create item (Admin)
- `PUT /api/inventory/:id` - Update item (Admin)
- `DELETE /api/inventory/:id` - Delete item (Admin)

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category
- `POST /api/categories` - Create (Admin)
- `PUT /api/categories/:id` - Update (Admin)
- `DELETE /api/categories/:id` - Delete (Admin)

### Units
- `GET /api/units` - Get all units
- `GET /api/units/:id` - Get unit
- `POST /api/units` - Create (Admin)
- `PUT /api/units/:id` - Update (Admin)
- `DELETE /api/units/:id` - Delete (Admin)

### Users (Admin Only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id/role` - Change user role
- `PUT /api/users/:id/toggle-status` - Toggle active status
- `DELETE /api/users/:id` - Delete user

## 📝 Database Models

### User
- id, username (unique), password (hashed), role, firstName, lastName
- isActive, lastLogin, timestamps

### Category
- id, name (unique), description
- isActive, timestamps

### Unit
- id, name (unique), abbreviation (unique), description
- isActive, timestamps

### Inventory
- id, name, description, quantity, price, sku (unique)
- categoryId (foreign key), unitId (foreign key)
- lowStockThreshold, status (enum), isActive
- createdById, updatedById (audit trail), timestamps

## 🛠️ Development

### Running Tests
```bash
cd backend
npm test  # When tests are added
```

### Database Seeding
To add sample data to the database:
```bash
cd backend
npm run seed
```

### Database Schema
The system automatically syncs the database schema on startup:
```javascript
db.sequelize.sync({ force: false })  // Safe mode: doesn't drop existing tables
```

## 🔧 Configuration

Edit `.env` file to configure:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=inventory_db
PORT=5000
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:8080
```

## 📦 Dependencies

### Backend
- **express** - Web framework
- **sequelize** - ORM
- **mysql2** - MySQL driver
- **jsonwebtoken** - JWT authentication
- **bcrypt** - Password hashing
- **cors** - CORS middleware
- **helmet** - Security middleware
- **morgan** - Request logging
- **dotenv** - Environment variables

### Frontend
- Bootstrap 5 - CSS framework
- Chart.js - Data visualization
- Font Awesome - Icons

## 🚨 Error Handling

The system provides comprehensive error handling:
- HTTP Status codes (200, 400, 401, 403, 404, 500)
- Detailed error messages
- Request validation
- Database constraint checks
- Graceful degradation

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token validation
- Role-based access control (RBAC)
- CORS configured
- Helmet security headers
- Input validation and sanitization
- Soft deletes (data preservation)
- Audit trail (createdBy, updatedBy)

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1024px)
- Mobile (480px - 768px)
- Small mobile (<480px)

## 🐛 Troubleshooting

### Database Connection Error
```
Error: Unable to connect to MySQL at localhost
```
- Verify MySQL is running
- Check DB_USER and DB_PASSWORD in .env
- Ensure inventory_db database exists

### CORS Error
```
Access to XMLHttpRequest blocked by CORS
```
- Verify backend is running on port 5000
- Check CLIENT_URL in .env
- Ensure frontend is on http://localhost:8080

### Token Expired
- Clear localStorage and login again
- Tokens expire after 24 hours by design

### Port Already in Use
```bash
# Change ports in code or kill process:
# Windows: netstat -ano | findstr :5000
# Linux: lsof -i :5000
```

## 📝 Logging

The application logs:
- SQL queries (prefixed with [SQL])
- Authentication events (prefixed with [AUTH])
- API requests (method + path)
- Errors and warnings

## 🔄 Data Synchronization

Products are soft-deleted (marked as isActive=false) to preserve data integrity and enable recovery.

## 📚 Additional Resources

- Express.js: https://expressjs.com/
- Sequelize ORM: https://sequelize.org/
- JWT: https://jwt.io/
- Bootstrap: https://getbootstrap.com/

## 🤝 Contributing

When making changes:
1. Update relevant tests
2. Follow existing code style
3. Update documentation
4. Test thoroughly before committing

## 📄 License

This project is provided as-is for educational and commercial use.

## ✅ Checklist for First Run

- [ ] MySQL server is running
- [ ] Database 'inventory_db' is created
- [ ] .env file is configured with correct credentials
- [ ] Backend dependencies installed (`npm install` in backend/)
- [ ] Frontend dependencies installed (`npm install` in frontend/)
- [ ] Backend server started (`npm run dev` in backend/)
- [ ] Frontend server started (`npm run dev` in frontend/)
- [ ] Can access login page at http://localhost:8080/frontend/pages/login.html
- [ ] Can login with admin/admin123
- [ ] Database has been seeded (optional but recommended)

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API documentation
3. Check browser console for JavaScript errors
4. Check backend logs for server errors
5. Verify all services are running

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Production Ready

