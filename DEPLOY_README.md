# cPanel Deployment Instructions

This package is optimized for cPanel shared hosting. It include all dependencies and pre-built assets.

## Quick Start

1.  **Upload & Extract**: Upload `political-deployment.zip` to your `public_html` directory (or the root of your domain) and extract it.
2.  **Configure Environment**:
    - Rename `.env.example` to `.env`.
    - Edit `.env` and update:
        - `APP_URL`: Your full website URL (e.g., `https://yourdomain.com`).
        - `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`: Your cPanel MySQL details.
3.  **Run Final Setup** (via cPanel Terminal or SSH):
    ```bash
    # Generate app key if not set
    php artisan key:generate
    
    # Run migrations
    php artisan migrate --force
    
    # Create the storage link
    php artisan storage:link
    
    # Create your admin account
    php artisan make:admin
    ```

## Important Notes

- **Root Access**: The included `.htaccess` file automatically redirects traffic to the `public/` folder. You don't need to change your domain's document root in cPanel.
- **PHP Version**: Ensure your cPanel is set to use **PHP 8.2 or higher**.
- **Permissions**: If you see a 500 error, ensure `storage` and `bootstrap/cache` directories are writable (usually 755 or 775).

## Troubleshooting

- **500 Error?** Check `storage/logs/laravel.log`.
- **Admin Login?** Use the `php artisan make:admin` command to create your user.
- **Missing Assets?** The zip includes `public/build/`, which contains all CSS and JS.
