<?php

namespace Database\Seeders;

use App\Models\ClassSession;
use Illuminate\Database\Seeder;

class ClassSessionSeeder extends Seeder
{
    public function run(): void
    {
        ClassSession::factory()->count(20)->create();
    }
}