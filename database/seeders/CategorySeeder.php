<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Category::create(['name' => 'Tier 1', 'rate' => 50]);
        Category::create(['name' => 'Tier 2', 'rate' => 55]);
        Category::create(['name' => 'Tier 3', 'rate' => 60]);
    }
}