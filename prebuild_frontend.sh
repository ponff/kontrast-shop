#!/bin/bash
set -e

echo "=== Prebuild Frontend Script ==="
echo "This script builds the frontend locally and prepares it for deployment"

cd front

echo "Installing dependencies..."
npm ci

echo "Building Next.js application..."
npm run build

echo "✓ Frontend built successfully!"
echo "The .next folder is ready for deployment"
echo ""
echo "Next steps:"
echo "1. Commit and push your changes"
echo "2. On server: git pull"
echo "3. On server: docker-compose -f docker-compose.prebuilt.yml up -d --build"
