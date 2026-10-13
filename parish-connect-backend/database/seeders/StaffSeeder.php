<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class StaffSeeder extends Seeder
{
    public function run(): void
    {
        $staff = [
            [
                'name' => 'Parish Priest',
                'email' => 'priest@parishconnect.local',
                'role' => 'priest'
            ],
            [
                'name' => 'Parish Secretary',
                'email' => 'secretary@parishconnect.local',
                'role' => 'secretary'
            ],
            [
                'name' => 'Ministry Coordinator',
                'email' => 'coordinator@parishconnect.local',
                'role' => 'ministry_coordinator'
            ]
        ];

        foreach ($staff as $person) {
            $password = env('INITIAL_STAFF_PASSWORD');

            if (empty($password) || strlen($password) < 12) {
                throw new \RuntimeException(
                    'Set INITIAL_STAFF_PASSWORD to a strong password of at least 12 characters.'
                );
            }

            User::firstOrCreate(
                [
                    'email' => $person['email']
                ],
                [
                    'name' => $person['name'],
                    'password' => Hash::make($password),
                    'role' => $person['role'],
                    'status' => 'active'
                ]
            );
        }
    }
}
