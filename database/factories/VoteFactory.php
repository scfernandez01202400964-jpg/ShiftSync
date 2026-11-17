<?php

namespace Database\Factories;

use App\Models\ClassSession;
use App\Models\Tutor;
use App\Models\Vote;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoteFactory extends Factory
{
    protected $model = Vote::class;

    public function definition(): array
    {
        return [
            'tutor_id' => Tutor::inRandomOrder()->value('id'),
            'class_session_id' => ClassSession::inRandomOrder()->value('id'),
            'voted_at' => now(),
        ];
    }
}