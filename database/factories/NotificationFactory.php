<?php

namespace Database\Factories;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class NotificationFactory extends Factory
{
    protected $model = Notification::class;

    public function definition(): array
    {
        return [
            'user_id' => User::inRandomOrder()->value('id'),
            'title' => 'Class Assignment',
            'message' => 'You have been chosen to take a class.',
            'is_read' => fake()->boolean(30),
        ];
    }
}