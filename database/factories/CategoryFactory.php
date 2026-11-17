<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Category>
 */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'name' => 'Tier ' . fake()->unique()->numberBetween(4, 100),
            'rate' => fake()->randomFloat(2, 40, 120),
        ];
    }
}