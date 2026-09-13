<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function __construct()
    {
        $this->middleware('permission:view-access-control')->only(['index', 'show']);
        $this->middleware('permission:create-access-control')->only(['create', 'store']);
        $this->middleware('permission:update-access-control')->only(['edit', 'update']);
        $this->middleware('permission:delete-access-control')->only(['destroy']);
    }

    public function index(): Response
    {
        $users = User::with('roles')->orderBy('name')->get();

        return Inertia::render('users/index', [
            'users' => $users,
        ]);
    }

    public function create(): Response
    {
        $roles = Role::all();

        return Inertia::render('users/create', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }

        if ($request->user()->hasPermission('view-access-control') || $request->user()->hasRole('administrator')) {
            return redirect()->route('users.index')->with('success', 'User created successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'User created successfully.');
    }

    public function edit(User $user): Response
    {
        $roles = Role::all();
        $user->load('roles');

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = [
            'name' => $request->name,
            'email' => $request->email,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }

        if ($request->user()->hasPermission('view-access-control') || $request->user()->hasRole('administrator')) {
            return redirect()->route('users.index')->with('success', 'User updated successfully.');
        }

        return redirect()->route('dashboard')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user): RedirectResponse
    {
        $canView = request()->user()->hasPermission('view-access-control') || request()->user()->hasRole('administrator');
        $redirectRoute = $canView ? 'users.index' : 'dashboard';

        // Prevent self-deletion
        if ($user->id === auth()->id()) {
            return redirect()->route($redirectRoute)->with('error', 'You cannot delete your own account.');
        }

        // Prevent deleting the last administrator
        if ($user->hasRole('administrator')) {
            $adminCount = User::whereHas('roles', function ($query) {
                $query->where('slug', 'administrator');
            })->count();

            if ($adminCount <= 1) {
                return redirect()->route($redirectRoute)->with('error', 'Cannot delete the last administrator.');
            }
        }

        $user->roles()->detach();
        $user->delete();

        return redirect()->route($redirectRoute)->with('success', 'User deleted successfully.');
    }
}
