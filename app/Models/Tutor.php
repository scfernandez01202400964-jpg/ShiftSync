<?php

namespace App\Models;

class Tutor extends User
{
    protected $table = 'users';

    protected static function booted(): void
    {
        static::addGlobalScope('tutorOnly', fn ($q) => $q->where('role', 'tutor'));
        static::creating(fn ($tutor) => $tutor->role = 'tutor');
    }
}