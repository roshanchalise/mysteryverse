#!/bin/sh
# Startup script for Railway deployment
# This runs database migrations before starting the server

echo "🔄 Running database migrations..."
npx prisma db push --accept-data-loss

echo "🚀 Starting server..."
node server.js
