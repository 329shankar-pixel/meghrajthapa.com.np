# 404 Error Fix Guide for cPanel Deployment

## The Problem
Getting "404 Not Found" means Apache can't find your Laravel application's entry point.

## Most Common Cause: Wrong Document Root

### ✅ Solution 1: Fix Document Root in cPanel (RECOMMENDED)

1. **Log into cPanel**
2. **Go to "Domains" or "Addon Domains"**
3. **Find your domain** and click "Manage" or the settings icon
4. **Change the Document Root** to point to the `public` folder:
   - If you extracted to `/home/username/political-app/`
   - Set Document Root to: `/home/username/political-app/public`
   - Or if in `public_html`: `/home/username/public_html/political-app/public`

5. **Save changes** and wait 1-2 minutes for propagation

### Alternative Solution 2: Move Files (if you can't change document root)

If your hosting doesn't allow changing document root:

**Option A: Move public folder contents to web root**
```bash
# If your domain points to /home/username/public_html/
cd /home/username/public_html/
cp -r political-app/public/* .
cp political-app/public/.htaccess .

# Edit index.php to fix paths
```

Then edit `/home/username/public_html/index.php`:

**Change these lines:**
```php
// FROM:
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

// TO:
require __DIR__.'/political-app/vendor/autoload.php';
$app = require_once __DIR__.'/political-app/bootstrap/app.php';
```

**Option B: Create a symlink**
```bash
# Remove the current public_html if it's empty
rm -rf ~/public_html

# Create symlink to your Laravel public folder
ln -s ~/political-app/public ~/public_html
```

### Solution 3: Verify .htaccess is Present

Make sure the `.htaccess` file exists in your `public/` folder:
```bash
ls -la /path/to/your/app/public/.htaccess
```

If missing, create it with this content:
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>
```

### Solution 4: Check File Permissions

```bash
# Set correct permissions
chmod -R 755 /path/to/your/app
chmod -R 775 /path/to/your/app/storage
chmod -R 775 /path/to/your/app/bootstrap/cache
```

### Solution 5: Clear Laravel Cache (if you had it working before)

```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## How to Verify Your Setup

1. **Check where your domain points:**
   - In cPanel > Domains, see what folder your domain is pointing to
   
2. **Check if index.php exists in that location:**
   - The `index.php` file should be in the folder your domain points to
   
3. **Test direct access:**
   - Try accessing: `http://yourdomain.com/index.php`
   - If this works but homepage doesn't, it's an .htaccess issue

## Still Having Issues?

**Check Apache error logs** in cPanel > Error Logs to see the exact error.

Common error messages:
- "File not found" → Document root is wrong
- "No input file specified" → index.php path is incorrect  
- "Internal Server Error" → .htaccess syntax issue or permissions
