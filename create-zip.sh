#!/bin/bash

# Configuration
ZIP_NAME="political-deployment.zip"
PROJECT_DIR=$(pwd)

echo "🚀 Starting deployment package creation..."

# 1. Clean up old builds
echo "🧹 Cleaning up..."
rm -f "$ZIP_NAME"
rm -rf public/build/

# 2. Build Assets (Vite/Inertia)
echo "📦 Building assets..."
npm run build

# 3. Generate Wayfinder Actions
echo "🔗 Generating Wayfinder actions..."
php artisan wayfinder:generate

# 4. Optimize Laravel
echo "⚡ Optimizing Laravel..."
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan clear-compiled

# 5. Create the Zip
echo "🤐 Creating zip package..."
zip -r "$ZIP_NAME" . -x \
    "node_modules/*" \
    ".git/*" \
    "tests/*" \
    ".env" \
    "storage/logs/*" \
    "storage/framework/cache/data/*" \
    "storage/framework/sessions/*" \
    "storage/framework/views/*" \
    ".phpunit.result.cache" \
    "create-zip.sh" \
    ".vscode/*" \
    ".idea/*" \
    ".gemini/*" \
    ".vendor/*" \
    "*.log" \
    "*.zip"

echo "✅ Deployment package created: $ZIP_NAME"
echo "📊 Size: $(du -h $ZIP_NAME | cut -f1)"
