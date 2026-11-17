<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    use HasFactory;

    protected $fillable = ['tutor_id', 'class_session_id', 'voted_at'];

    public function tutor()
    {
        return $this->belongsTo(User::class, 'tutor_id');
    }

    public function classSession()
    {
        return $this->belongsTo(ClassSession::class);
    }
}