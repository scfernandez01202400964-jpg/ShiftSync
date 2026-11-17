<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('class_tutors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_session_id')->constrained()->cascadeOnDelete();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->enum('attendance_status', ['pending', 'present', 'absent'])->default('pending');
            // If this tutor replaced an absent one, this points back to the absent
            // tutor's own class_tutors row — so BOTH stay visible in the history.
            $table->foreignId('replaced_class_tutor_id')->nullable()->constrained('class_tutors')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('class_tutors');
    }
};