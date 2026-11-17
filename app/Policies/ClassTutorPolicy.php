<?php

namespace App\Policies;

use App\Models\ClassTutor;
use App\Models\User;

class ClassTutorPolicy
{
    // Admin only: this lists every tutor's attendance. Tutors will get their own
    // attendance page that only shows their own records.
    public function viewAny(User $user): bool { return $user->role === 'admin'; }

    public function view(User $user, ClassTutor $classTutor): bool
    {
        return $user->role === 'admin' || $user->id === $classTutor->tutor_id;
    }

    public function create(User $user): bool { return $user->role === 'admin'; }
    public function update(User $user, ClassTutor $classTutor): bool { return $user->role === 'admin'; }
    public function delete(User $user, ClassTutor $classTutor): bool { return $user->role === 'admin'; }
}