<?php

namespace Database\Seeders;

use App\Models\ClassTutor;
use Illuminate\Database\Seeder;

class ClassTutorSeeder extends Seeder
{
    public function run(): void
    {
        ClassTutor::factory()->count(25)->create();
    }
}