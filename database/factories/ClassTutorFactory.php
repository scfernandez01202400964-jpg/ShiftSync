<?php

namespace Database\Factories;

use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassTutorFactory extends Factory
{
    protected $model = ClassTutor::class;

    public function definition(): array
    {
        return [
            'class_session_id' => ClassSession::inRandomOrder()->value('id'),
            'tutor_id' => Tutor::inRandomOrder()->value('id'),
            'attendance_status' => fake()->randomElement(['pending', 'present', 'absent']),
        ];
    }
}