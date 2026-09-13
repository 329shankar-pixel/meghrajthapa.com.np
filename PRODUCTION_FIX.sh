#!/bin/bash

# Production Migration Fix Script
# Run this if you've already attempted migrations and got the error

echo "🔧 Fixing migration issue on production..."

# Option 1: If migrations haven't run yet or you can start fresh
echo ""
echo "Option 1: Fresh Migration (WARNING: This will drop all tables)"
echo "Run this command: php artisan migrate:fresh --force"
echo ""

# Option 2: If you have partial migrations
echo "Option 2: Manual Fix for Partial Migration"
echo "Run these commands one by one:"
echo ""
echo "1. Check current migration status:"
echo "   php artisan migrate:status"
echo ""
echo "2. If 'add_cover_image_to_events_table' shows as not migrated, run:"
echo "   php artisan migrate --force"
echo ""
echo "3. If it shows as migrated but failed, rollback that specific migration:"
echo "   php artisan migrate:rollback --step=1 --force"
echo "   Then run: php artisan migrate --force"
echo ""

# Option 3: Direct database fix
echo "Option 3: Direct Database Fix (if you have database access)"
echo "Run this SQL query in your MySQL database:"
echo ""
echo "ALTER TABLE events ADD COLUMN cover_image VARCHAR(255) NULL AFTER content;"
echo "Then mark migration as done:"
echo "INSERT INTO migrations (migration, batch) VALUES ('2026_01_25_124332_add_cover_image_to_events_table', (SELECT MAX(batch) FROM (SELECT batch FROM migrations) as subquery));"
echo ""
