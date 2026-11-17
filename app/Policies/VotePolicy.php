<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Vote;

class VotePolicy
{
    public function viewAny(User $user): bool { return true; }

    public function view(User $user, Vote $vote): bool
    {
        return $user->role === 'admin' || $user->id === $vote->tutor_id;
    }

    public function create(User $user): bool { return $user->role === 'tutor'; }

    public function delete(User $user, Vote $vote): bool
    {
        return $user->role === 'admin' || $user->id === $vote->tutor_id;
    }
}