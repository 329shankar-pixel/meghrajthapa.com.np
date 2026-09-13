#!/bin/bash

# cPanel Deployment Setup Script
# This script sets up the Laravel application for cPanel hosting

echo "=========================================="
echo "Setting up Laravel for cPanel..."
echo "=========================================="

# Step 1: Backup original index.php
if [ -f "index.php" ] && [ ! -f "index.php.original" ]; then
    cp index.php index.php.original
    echo "✓ Backed up original index.php"
fi

# Step 2: Use cPanel-friendly index.php
if [ -f "index-cpanel.php" ]; then
    cp index-cpanel.php index.php
    echo "✓ Installed cPanel-friendly index.php"
fi

# Step 3: Set permissions
chmod -R 755 .
chmod -R 775 ../laravel-app/storage
chmod -R 775 ../laravel-app/bootstrap/cache
echo "✓ Set correct permissions"

# Step 4: Create storage symlink if needed
if [ ! -L "storage" ] && [ -d "../laravel-app/storage/app/public" ]; then
    ln -s ../laravel-app/storage/app/public storage
    echo "✓ Created storage symlink"
fi

echo ""
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Rename .env.production to .env"
echo "2. Update database credentials in .env"
echo "3. Run: cd ../laravel-app && php artisan key:generate"
echo "4. Run: php artisan migrate --force"
echo "5. Run: php artisan make:admin your@email.com password 'Your Name'"
echo ""
