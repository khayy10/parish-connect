<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Production never creates demo accounts with public, shared passwords.
        // Provision the first authorized priest only when explicitly requested.
        if (filter_var(env('BOOTSTRAP_PRIEST_ON_START', false), FILTER_VALIDATE_BOOLEAN)) {
            $this->call(StaffSeeder::class);
        }
    }
}
