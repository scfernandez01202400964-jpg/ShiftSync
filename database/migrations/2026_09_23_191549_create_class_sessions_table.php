<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_sessions', function (Blueprint $table) {
            $table->id();
            $table->string('school');
            $table->date('class_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->unsignedInteger('tutors_needed')->default(1);
            $table->enum('status', ['proposed', 'finalized'])->default('proposed');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_sessions');
    }
};