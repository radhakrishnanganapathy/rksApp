#!/usr/bin/env bash
# Exit on error
set -o errexit

# 1. Build the Frontend
echo "Installing frontend dependencies..."
npm install

echo "Building frontend..."
npm run build

# 2. Setup the Backend
echo "Installing backend dependencies..."
cd server
npm install

echo "Build complete!"
