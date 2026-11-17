<?php

namespace Database\Factories;

use App\Models\ClassSession;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassSessionFactory extends Factory
{
    protected $model = ClassSession::class;

    public function definition(): array
    {
        $start = fake()->randomElement(['08:00', '08:30', '09:00', '09:30', '10:00', '10:30']);

        return [
            'school' => fake()->randomElement(['Sakuragaoka', 'Tokyo Academy', 'Sunrise School', 'Midori Institute']),
            'class_date' => fake()->dateTimeBetween('now', '+1 week'),
            'start_time' => $start,
            'end_time' => date('H:i', strtotime($start) + 1800), // 30 mins later
            'tutors_needed' => fake()->numberBetween(1, 3),
            'status' => 'proposed',
            'created_by' => User::where('role', 'admin')->value('id'),
        ];
    }
}