#!/bin/bash

# Development startup script for Acquisition App with PostgreSQL
# This script starts the application in development mode using PostgreSQL

echo "🚀 Starting Acquisition App in Development Mode"
echo "================================================"

# Check if .env.development exists
if [ ! -f .env.development ]; then
    echo "❌ Error: .env.development file not found!"
    echo "   Please copy .env.development from the template and update with your PostgreSQL credentials."
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "   Please start Docker Desktop and try again."
    exit 1
fi

echo "📦 Building and starting development containers..."
echo "   - PostgreSQL container will start"
echo "   - Application will run with hot reload enabled"
echo ""

# Start development environment in detached mode
docker compose -f docker-compose.dev.yml up --build -d

# Wait for the database to be ready
echo "⏳ Waiting for the database to be ready..."
until docker compose exec postgres pg_isready -U postgres >/dev/null 2>&1; do
  sleep 2
done

echo ""
echo "🎉 Development environment started!"
echo "   Application: http://localhost:5173"
echo "   Database: postgres://postgres:password@localhost:5432/postgres"
echo ""
echo "To stop the environment, run: docker compose down"
