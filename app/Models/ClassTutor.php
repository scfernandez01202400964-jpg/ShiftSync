<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ClassTutor extends Model
{
    use HasFactory;

        protected $fillable = ['class_session_id', 'tutor_id', 'attendance_status', 'replaced_class_tutor_id'];
        
    public function classSession()
    {
        return $this->belongsTo(ClassSession::class);
    }

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    // The absent assignment this one replaced, if any
    public function replaces()
    {
        return $this->belongsTo(ClassTutor::class, 'replaced_class_tutor_id');
    }
}