#!/bin/bash

# Project Management App - Development Setup Script

echo "🚀 Starting Minimal Project Management App"
echo "========================================="

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running!"
    echo ""
    echo "To start MongoDB:"
    echo "  macOS (with Homebrew): brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    echo "  Windows: net start MongoDB"
    echo ""
    echo "Or use MongoDB Atlas (cloud):"
    echo "  1. Create account at https://www.mongodb.com/atlas"
    echo "  2. Get connection string"
    echo "  3. Update MONGODB_URI in backend/.env"
    echo ""
    exit 1
fi

echo "✅ MongoDB is running"

# Start backend
echo "🔧 Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 Servers started successfully!"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:5000"
echo "🏥 Health:   http://localhost:5000/api/health"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
