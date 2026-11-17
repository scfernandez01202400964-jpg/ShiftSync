<?php

namespace App\Policies;

use App\Models\Tutor;
use App\Models\User;

class TutorPolicy
{
    public function viewAny(User $user): bool { return $user->role === 'admin'; }
    public function view(User $user, Tutor $tutor): bool { return $user->role === 'admin'; }
    public function create(User $user): bool { return $user->role === 'admin'; }
    public function update(User $user, Tutor $tutor): bool { return $user->role === 'admin'; }
    public function delete(User $user, Tutor $tutor): bool { return $user->role === 'admin'; }
}