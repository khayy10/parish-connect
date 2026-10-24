<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Bootstrap exactly one first priest account from private server variables.
 * DO NOT create staff accounts from public registration requests.
 * Once signed in, the priest can create secretary/coordinator/staff accounts.
 */
class StaffSeeder extends Seeder
{
    public function run(): void
    {
        if (User::where('role', 'priest')->exists()) {
            $this->command?->info('A priest account already exists. No account was created.');
            return;
        }

        $email = strtolower(trim((string) env('INITIAL_PRIEST_EMAIL', '')));
        $password = (string) env('INITIAL_PRIEST_PASSWORD', '');
        $name = trim((string) env('INITIAL_PRIEST_NAME', 'Parish Priest'));

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12) {
            throw new \RuntimeException('To provision the first priest, set INITIAL_PRIEST_EMAIL and INITIAL_PRIEST_PASSWORD (12+ characters) in Render Environment.');
        }
        if (User::where('email', $email)->exists()) {
            throw new \RuntimeException('INITIAL_PRIEST_EMAIL belongs to an existing account; choose an unused email.');
        }

        User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password),
            'role' => 'priest',
            'status' => 'active',
        ]);

        $this->command?->info('Initial Parish Priest account created. Change the initial password after provisioning.');
    }
}
