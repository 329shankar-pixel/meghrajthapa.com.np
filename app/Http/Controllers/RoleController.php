<?php

namespace App\Http\Controllers;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class RoleController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-access-control')->only(['index', 'show']);
        $this->middleware('permission:create-access-control')->only(['create', 'store']);
        $this->middleware('permission:update-access-control')->only(['edit', 'update']);
        $this->middleware('permission:delete-access-control')->only(['destroy']);
    }

    public function index()
    {
        $roles = Role::with('permissions')->get();
        return Inertia::render('roles/index', [
            'roles' => $roles
        ]);
    }

    public function create()
    {
        $permissions = Permission::all();
        return Inertia::render('roles/create', [
            'permissions_grouped' => $this->groupPermissions($permissions)
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'array',
            'is_default' => 'boolean'
        ]);

        $role = Role::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'is_default' => $request->is_default ?? false,
        ]);

        if ($role->is_default) {
            Role::where('id', '!=', $role->id)->update(['is_default' => false]);
        }

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        if ($request->user()->hasPermission('view-access-control') || $request->user()->hasRole('administrator')) {
            return redirect()->route('roles.index')->with('success', 'Role created successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Role created successfully.');
    }

    public function edit(Role $role)
    {
        $permissions = Permission::all();
        $role->load('permissions');
        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissions_grouped' => $this->groupPermissions($permissions)
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'permissions' => 'array',
            'is_default' => 'boolean'
        ]);

        $role->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'description' => $request->description,
            'is_default' => $request->is_default ?? false,
        ]);

        if ($role->is_default) {
            Role::where('id', '!=', $role->id)->update(['is_default' => false]);
        }

        if ($request->has('permissions')) {
            $role->permissions()->sync($request->permissions);
        }

        if ($request->user()->hasPermission('view-access-control') || $request->user()->hasRole('administrator')) {
            return redirect()->route('roles.index')->with('success', 'Role updated successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'Role updated successfully.');
    }

    public function destroy(Role $role)
    {
        $canView = request()->user()->hasPermission('view-access-control') || request()->user()->hasRole('administrator');
        $redirectRoute = $canView ? 'roles.index' : 'dashboard';

        if ($role->is_default) {
            return redirect()->route($redirectRoute)->with('error', 'Cannot delete the default role. Please set another role as default first.');
        }

        $role->delete();
        return redirect()->route($redirectRoute)->with('success', 'Role deleted successfully.');
    }

    private function groupPermissions($permissions)
    {
        return $permissions->groupBy(function ($permission) {
            $parts = explode('-', $permission->slug);
            if (count($parts) > 1) {
                return ucwords(str_replace('-', ' ', implode('-', array_slice($parts, 1))));
            }
            return 'General';
        })->map(function ($group) {
            return $group->sortBy(function ($p) {
                $order = ['view' => 1, 'create' => 2, 'update' => 3, 'delete' => 4];
                $action = explode('-', $p->slug)[0];
                return $order[$action] ?? 99;
            })->values();
        });
    }
}
