<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all permissions
        $modules = [
            'members' => 'Party Members',
            'events' => 'Events',
            'news' => 'News',
            'blog' => 'Blog',
            'activities' => 'Activities',
            'resources' => 'Resources',
            'leader' => 'Leader',
            'access-control' => 'Access Control',
            'settings' => 'Settings',
            'member-types' => 'Member Types',
            'emails' => 'Email Center',
        ];

        $actions = [
            'view' => 'View',
            'create' => 'Create',
            'update' => 'Update',
            'delete' => 'Delete',
        ];

        // 1. Dashboard Permission
        Permission::firstOrCreate(
            ['slug' => 'view-dashboard'],
            ['name' => 'View Dashboard', 'slug' => 'view-dashboard', 'description' => 'Access the admin dashboard']
        );

        // 2. Module Permissions
        foreach ($modules as $slug => $name) {
            foreach ($actions as $actionSlug => $actionName) {
                Permission::firstOrCreate(
                    ['slug' => "{$actionSlug}-{$slug}"],
                    [
                        'name' => "{$actionName} {$name}", 
                        'slug' => "{$actionSlug}-{$slug}", 
                        'description' => "{$actionName} {$name} records"
                    ]
                );
            }
        }

        // Clean up old permissions if necessary (optional, avoiding data loss for now)
        // Permission::where('slug', 'like', 'manage-%')->delete();

        // Create Administrator role with all permissions
        $adminRole = Role::updateOrCreate(
            ['slug' => 'administrator'],
            [
                'name' => 'Administrator',
                'description' => 'Full access to all dashboard features',
                'is_default' => false,
            ]
        );

        // Assign all permissions to administrator role
        $allPermissionIds = Permission::pluck('id')->toArray();
        $adminRole->permissions()->sync($allPermissionIds);

        // Create Editor role
        $editorRole = Role::updateOrCreate(
            ['slug' => 'editor'],
            [
                'name' => 'Editor',
                'description' => 'Can manage content but not users or settings',
                'is_default' => false,
            ]
        );

        // Editor permissions: CRUD for content modules, View restricted modules
        $editorModules = ['news', 'blog', 'activities', 'events', 'resources', 'members', 'leader', 'member-types'];
        $editorPermissions = [];
        
        // Add View Dashboard
        $dashboardPerm = Permission::where('slug', 'view-dashboard')->first();
        if ($dashboardPerm) $editorPermissions[] = $dashboardPerm->id;

        foreach ($editorModules as $module) {
            // Editor can View, Create, Update
            foreach (['view', 'create', 'update'] as $action) {
                $perm = Permission::where('slug', "{$action}-{$module}")->first();
                if ($perm) $editorPermissions[] = $perm->id;
            }
        }
        $editorRole->permissions()->sync($editorPermissions);

        // Create Viewer role with read-only access
        $viewerRole = Role::updateOrCreate(
            ['slug' => 'viewer'],
            [
                'name' => 'Viewer',
                'description' => 'Read-only access to dashboard',
                'is_default' => true,
            ]
        );

        $viewerPermissions = [];
        if ($dashboardPerm) $viewerPermissions[] = $dashboardPerm->id;
        
        // Viewer can View all modules
        foreach ($modules as $slug => $name) {
            $perm = Permission::where('slug', "view-{$slug}")->first();
            if ($perm) $viewerPermissions[] = $perm->id;
        }
        $viewerRole->permissions()->sync($viewerPermissions);

        // Assign administrator role to first user if exists
        $firstUser = User::first();
        if ($firstUser && !$firstUser->roles()->exists()) {
            $firstUser->roles()->attach($adminRole->id);
        }

        $this->command->info('Granular permissions and roles seeded successfully!');
    }
}
