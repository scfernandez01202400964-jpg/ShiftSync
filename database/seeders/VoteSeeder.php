<?php

namespace Database\Seeders;

use App\Models\ClassSession;
use App\Models\Tutor;
use App\Models\Vote;
use Illuminate\Database\Seeder;

class VoteSeeder extends Seeder
{
    public function run(): void
    {
        $tutors = Tutor::inRandomOrder()->limit(10)->get();
        $classes = ClassSession::inRandomOrder()->limit(10)->get();

        foreach ($tutors as $tutor) {
            Vote::firstOrCreate([
                'tutor_id' => $tutor->id,
                'class_session_id' => $classes->random()->id,
            ], ['voted_at' => now()]);
        }
    }
}