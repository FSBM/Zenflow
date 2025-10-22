#!/bin/bash

# Project Management App - Development Setup Script

echo "🚀 Starting Project Management App with MongoDB Atlas"
echo "=================================================="

# Function to check if a port is in use
check_port() {
    local port=$1
    local service=$2
    if lsof -i :$port > /dev/null 2>&1; then
        echo "✅ $service is running on port $port"
        return 0
    else
        echo "❌ Port $port is not in use"
        return 1
    fi
}

echo ""
echo "📊 Checking current services..."
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
