# cPanel-Ready Laravel Deployment Package

## 📂 File Structure (After Extraction)

When you extract this zip to your hosting account, you'll get:

```
public_html/              ← Your domain points here (web accessible)
├── index.php            ← Laravel entry point
├── .htaccess            ← URL rewriting rules
├── build/               ← Compiled assets
├── favicon.ico
├── logo.svg
├── robots.txt
├── setup-cpanel.sh      ← Auto-setup script
└── storage/             ← Symlink (will be created)

laravel-app/             ← Main application (OUTSIDE web root for security)
├── app/
├── bootstrap/
├── config/
├── database/
├── routes/
├── storage/
├── vendor/              ← Run 'composer install' to create this
├── .env.production      ← Rename to .env and configure
├── artisan
├── composer.json
└── DEPLOY_README.md
```

## 🚀 Quick Deployment (3 Steps)

### Step 1: Upload & Extract
1. Upload `political-app-cpanel.zip` to your cPanel File Manager
2. **Extract to HOME directory** (e.g., `/home/username/`)
3. You should now have:
   - `/home/username/public_html/` (web files)
   - `/home/username/laravel-app/` (application files)

### Step 2: Configure Environment
```bash
# In cPanel Terminal or SSH:
cd ~/laravel-app
mv .env.production .env
nano .env  # Edit database credentials
```

Update these in `.env`:
```env
APP_URL=https://yourdomain.com
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password
```

### Step 3: Run Setup Commands
```bash
cd ~/laravel-app
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan make:admin admin@example.com password "Admin Name"

# Create storage symlink
cd ~/public_html
ln -s ../laravel-app/storage/app/public storage
```

**That's it!** Visit your domain - the site should work. 🎉

---

## 🔧 Alternative: Automated Setup (Easier!)

If you have SSH/Terminal access:

```bash
cd ~/public_html
chmod +x setup-cpanel.sh
./setup-cpanel.sh
```

Then follow the on-screen instructions.

---

## ⚠️ Important Notes

### Document Root
Your domain should point to `public_html/` (default in most cPanel setups). If not:
- cPanel > Domains > Manage > Set Document Root to `/home/username/public_html`

### File Permissions
- Web files: `755`
- Storage folders: `775`

### Cron Job (For Queues/Scheduled Tasks)
```
* * * * * cd /home/username/laravel-app && php artisan schedule:run >> /dev/null 2>&1
```

### if Getting 500 Error
Check: `/home/username/laravel-app/storage/logs/laravel.log`

### If Assets Don't Load
Make sure the storage symlink exists:
```bash
ls -la ~/public_html/storage
```
If not, create it:
```bash
cd ~/public_html
ln -s ../laravel-app/storage/app/public storage
```

---

## 📧 Creating Admin User

**Method 1: Command Line**
```bash
cd ~/laravel-app
php artisan make:admin admin@yourdomain.com SecurePassword123 "Admin Name"
```

**Method 2: Via Seeder**
```bash
php artisan db:seed --class=PermissionSeeder --force
# Creates: test@example.com (check DatabaseSeeder.php for password)
```

---

## 🆘 Troubleshooting

### 404 Not Found
- Verify `public_html/index.php` exists
- Check `.htaccess` is in `public_html/`
- Ensure mod_rewrite is enabled (contact hosting support)

### Blank White Page
```bash
chmod -R 775 ~/laravel-app/storage
chmod -R 775 ~/laravel-app/bootstrap/cache
```

### Database Connection Error
- Verify credentials in `.env`
- Ensure database exists in cPanel > MySQL Databases
- Check database user has privileges

### Composer Not Found
Ask your hosting support to enable/install Composer, or use Softaculous in cPanel to install it.

---

## 📞 Support

Check the detailed troubleshooting guides:
- `DEPLOY_README.md` in `laravel-app/`
- `FIX-404-ERROR.md` in `laravel-app/`
