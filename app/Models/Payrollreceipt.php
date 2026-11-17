<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PayrollReceipt extends Model
{
    protected $fillable = [
        'tutor_id', 'period_start', 'period_end', 'classes', 'minutes', 'rate', 'amount', 'received_at',
    ];

    // period_start and period_end stay plain "Y-m-d" text on purpose, so they match exactly in queries.
    protected function casts(): array
    {
        return ['received_at' => 'datetime'];
    }
}