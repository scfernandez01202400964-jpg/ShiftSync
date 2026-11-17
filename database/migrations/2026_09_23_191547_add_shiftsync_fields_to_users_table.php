<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username')->unique()->nullable()->after('id');
            $table->string('full_name')->nullable()->after('name');
            $table->enum('role', ['admin', 'tutor'])->default('tutor');
            $table->enum('status', ['Active', 'On Leave', 'Inactive'])->default('Active');
            $table->decimal('rate', 10, 2)->nullable();
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropColumn(['username', 'full_name', 'role', 'status', 'rate', 'category_id']);
        });
    }
};