<?php

namespace App\Support;

use App\Models\Notification;
use App\Models\User;

class Notify
{
    // Sends one in-app alert to every active admin who has "In-app notifications" turned on.
    public static function admins(string $title, string $message): void
    {
        User::where('role', 'admin')->where('status', 'Active')->get()
            ->filter(fn ($admin) => $admin->preferences['in_app_notifications'] ?? true)
            ->each(fn ($admin) => Notification::create([
                'user_id' => $admin->id,
                'title' => $title,
                'message' => $message,
            ]));
    }

    // What the bell shows for one user: the unread count plus the latest alerts.
    public static function bellFor(User $user): array
    {
        return [
            'unread' => Notification::where('user_id', $user->id)->where('is_read', false)->count(),
            'recent' => Notification::where('user_id', $user->id)
                ->orderByDesc('id')->take(6)->get()
                ->map(fn ($n) => [
                    'id' => $n->id,
                    'title' => $n->title,
                    'message' => $n->message,
                    'time' => $n->created_at->diffForHumans(),
                    'read' => (bool) $n->is_read,
                ])
                ->values(),
        ];
    }
}