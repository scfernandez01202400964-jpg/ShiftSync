<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payroll_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tutor_id')->constrained('users')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            // What the tutor confirmed receiving (a snapshot, so later changes don't rewrite it).
            $table->unsignedInteger('classes');
            $table->unsignedInteger('minutes');
            $table->decimal('rate', 10, 2);
            $table->decimal('amount', 10, 2);
            $table->timestamp('received_at');
            $table->timestamps();

            // A tutor confirms each cutoff once.
            $table->unique(['tutor_id', 'period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payroll_receipts');
    }
};