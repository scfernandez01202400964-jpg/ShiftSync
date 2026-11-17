<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // The only account. Log in with username OGS_shaina and password fastqueen47.
        User::create([
            'username' => 'OGS_shaina',
            'full_name' => 'Shainagrezzle C. Fernandez',
            'name' => 'Shainagrezzle C. Fernandez',
            'email' => 'ogs.shaina@shiftsync.test',
            'password' => Hash::make('fastqueen47'),
            'role' => 'admin',
            'status' => 'Active',
        ]);

        // Tier 1 / 2 / 3 pay rates
        $this->call(CategorySeeder::class);
    }
}