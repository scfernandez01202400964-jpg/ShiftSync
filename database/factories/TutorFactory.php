<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Tutor;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class TutorFactory extends Factory
{
    protected $model = Tutor::class;

    public function definition(): array
    {
        $name = fake()->name();
        $category = Category::inRandomOrder()->first();

        return [
            'username' => fake()->unique()->userName(),
            'full_name' => $name,
            'name' => $name,
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password'),
            'category_id' => $category?->id,
            'rate' => $category?->rate, // the tier's rate: Tier 1 = 50, Tier 2 = 55, Tier 3 = 60
            'status' => 'Active',
        ];
    }
}