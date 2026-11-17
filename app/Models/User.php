<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'username',
        'full_name',
        'email',
        'password',
        'role',
        'status',
        'rate',
        'category_id',
        'preferences',
        'photo',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Sent to the React pages along with the user, so any page can show the photo.
    protected $appends = ['photo_url'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'preferences' => 'array',
        ];
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    protected function photoUrl(): Attribute
    {
        return Attribute::get(fn () => $this->photo ? asset($this->photo) : null);
    }
}