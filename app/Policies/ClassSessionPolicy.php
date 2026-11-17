<?php

namespace App\Policies;

use App\Models\ClassSession;
use App\Models\User;

class ClassSessionPolicy
{
    public function viewAny(User $user): bool { return true; }
    public function view(User $user, ClassSession $classSession): bool { return true; }
    public function create(User $user): bool { return $user->role === 'admin'; }
    public function update(User $user, ClassSession $classSession): bool { return $user->role === 'admin'; }
    public function delete(User $user, ClassSession $classSession): bool { return $user->role === 'admin'; }
}