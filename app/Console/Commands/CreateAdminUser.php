<?php

namespace App\Console\Commands;

use App\Models\Role;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdminUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'make:admin {email?} {password?} {name?}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new administrator user';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $name = $this->argument('name') ?: $this->ask('Name', 'Administrator');
        $email = $this->argument('email') ?: $this->ask('Email address');
        $password = $this->argument('password') ?: $this->secret('Password');

        if (!$email || !$password) {
            $this->error('Email and password are required.');
            return;
        }

        $adminRole = Role::where('slug', 'administrator')->first();

        if (!$adminRole) {
            $this->warn('Administrator role not found. Running PermissionSeeder first...');
            $this->call('db:seed', ['--class' => 'PermissionSeeder']);
            $adminRole = Role::where('slug', 'administrator')->first();
        }

        $user = User::firstOrNew(['email' => $email]);
        $wasExistingUser = $user->exists;
        $user->name = $name;
        $user->password = Hash::make($password);
        $user->email_verified_at = $user->email_verified_at ?: now();
        $user->save();

        if ($adminRole) {
            $user->roles()->syncWithoutDetaching([$adminRole->id]);
            $this->info($wasExistingUser ? "Successfully updated admin user: {$email}" : "Successfully created admin user: {$email}");
        } else {
            $this->error('Could not find or create the Administrator role.');
        }
    }
}
