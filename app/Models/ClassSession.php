<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassSession extends Model
{
    use HasFactory;

    protected $fillable = ['school', 'class_date', 'start_time', 'end_time', 'tutors_needed', 'status', 'created_by'];

    protected function casts(): array
    {
        return ['class_date' => 'date'];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function classTutors()
    {
        return $this->hasMany(ClassTutor::class);
    }

    public function votes()
    {
        return $this->hasMany(Vote::class);
    }
}