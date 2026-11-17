<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('class_session_id')->constrained()->cascadeOnDelete();
            $table->timestamp('voted_at')->useCurrent();
            $table->timestamps();

            // A tutor can only vote once for the same class
            $table->unique(['tutor_id', 'class_session_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votes');
    }
};