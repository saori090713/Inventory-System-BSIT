#!/bin/bash
# Quick Setup Script for Database Issues
# Run this when data isn't being saved to the database

echo "🔧 Starting Inventory System Database Setup..."
echo ""

# Step 1: Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in backend directory"
    echo "   Please run: cd project/backend"
    exit 1
fi

# Step 2: Run setup
echo "Step 1: Initializing database..."
node setup-database.js

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Database setup failed!"
    echo "   Common issues:"
    echo "   1. MySQL is not running"
    echo "   2. Invalid database credentials"
    echo "   3. Check .env file configuration"
    exit 1
fi

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "  1. Start the backend:"
echo "     npm start"
echo ""
echo "  2. Open browser and login:"
echo "     http://localhost:3000 (or your frontend URL)"
echo "     Username: admin"
echo "     Password: admin123"
echo ""
echo "  3. Add a test category/unit/item"
echo ""
echo "  4. Verify it was saved:"
echo "     mysql -u root inventory_db -e 'SELECT * FROM categories;'"
echo ""
