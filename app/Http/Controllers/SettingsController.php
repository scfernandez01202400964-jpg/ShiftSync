<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public const DEFAULTS = [
        'dark_mode' => false,
        'class_reminder' => 30, // minutes before a class
        'notification_sound' => 'bell',
        'in_app_notifications' => true,
        'voting_reminders' => true,
    ];

    private const PHOTO_DIR = 'uploads/avatars';

    // Admins and tutors share this page and these routes.
    public function edit(Request $request)
    {
        $user = $request->user();

        return Inertia::render('Settings/Edit', [
            'profile' => [
                'name' => $user->full_name ?? $user->name,
                'username' => $user->username,
                'id' => $this->displayId($user),
                'email' => $user->email,
                'photo_url' => $user->photo_url,
            ],
            'preferences' => array_merge(self::DEFAULTS, $user->preferences ?? []),
        ]);
    }

    // Each switch saves on its own, so only the changed setting is sent.
    public function update(Request $request)
    {
        $data = $request->validate([
            'dark_mode' => ['sometimes', 'boolean'],
            'class_reminder' => ['sometimes', 'integer', Rule::in([10, 15, 30, 60, 120])],
            'notification_sound' => ['sometimes', Rule::in(['bell', 'chime', 'ding', 'none'])],
            'in_app_notifications' => ['sometimes', 'boolean'],
            'voting_reminders' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $user->update([
            'preferences' => array_merge(self::DEFAULTS, $user->preferences ?? [], $data),
        ]);

        return back();
    }

    public function updatePhoto(Request $request)
    {
        $request->validate([
            // SVG is left out on purpose: an SVG file can carry scripts.
            'photo' => ['required', 'file', 'mimes:jpg,jpeg,png,webp', 'max:51200'], // 50 MB
        ], [
            'photo.mimes' => 'Choose a JPG, PNG or WebP image.',
            'photo.max' => 'That image is larger than 50 MB. Choose a smaller one.',
            'photo.uploaded' => 'The image could not be uploaded. Choose a file under 50 MB.',
        ]);

        $user = $request->user();
        $file = $request->file('photo');
        $name = Str::uuid() . '.' . $file->extension();

        $file->move(public_path(self::PHOTO_DIR), $name);

        $this->deletePhotoFile($user->photo);
        $user->update(['photo' => self::PHOTO_DIR . '/' . $name]);

        return back();
    }

    public function destroyPhoto(Request $request)
    {
        $user = $request->user();

        $this->deletePhotoFile($user->photo);
        $user->update(['photo' => null]);

        return back();
    }

    // Only ever delete files inside the avatars folder.
    private function deletePhotoFile(?string $path): void
    {
        if ($path && str_starts_with($path, self::PHOTO_DIR . '/')) {
            File::delete(public_path($path));
        }
    }

    // Looks like ADMIN-2026-001 or TUTOR-2026-0042.
    private function displayId(User $user): string
    {
        return strtoupper($user->role)
            . '-' . $user->created_at->format('Y')
            . '-' . str_pad($user->id, $user->role === 'admin' ? 3 : 4, '0', STR_PAD_LEFT);
    }
}