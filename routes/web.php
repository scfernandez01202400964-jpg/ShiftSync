<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\ClassSessionController;
use App\Http\Controllers\ClassTutorController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MyAttendanceController;
use App\Http\Controllers\MyPayrollController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ScheduleController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TutorController;
use App\Http\Controllers\VoteController;
use App\Http\Middleware\EnsureRole;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

// The dashboard shows the admin or the tutor version, depending on who is logged in.
Route::get('/dashboard', HomeController::class)
    ->middleware(['auth', 'verified'])->name('dashboard');

// Any logged-in user
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // The bell
    Route::get('notifications/summary', [NotificationController::class, 'summary'])->name('notifications.summary');
    Route::post('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');

    // Settings: the same page and routes for admins and tutors.
    Route::get('settings', [SettingsController::class, 'edit'])->name('settings.edit');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
    Route::post('settings/photo', [SettingsController::class, 'updatePhoto'])->name('settings.photo.update');
    Route::delete('settings/photo', [SettingsController::class, 'destroyPhoto'])->name('settings.photo.destroy');
});

// Admin only
Route::middleware(['auth', EnsureRole::class . ':admin'])->group(function () {
    Route::resource('categories', CategoryController::class);
    Route::resource('tutors', TutorController::class)->except(['show']);
    Route::resource('class-sessions', ClassSessionController::class);
    Route::post('class-sessions/{class_session}/assign', [ClassSessionController::class, 'assign'])
        ->name('class-sessions.assign');
    Route::resource('class-tutors', ClassTutorController::class)->only(['index']);
    Route::post('class-sessions/{class_session}/attendance', [ClassTutorController::class, 'record'])
        ->name('class-sessions.attendance');
    Route::get('payroll', [PayrollController::class, 'index'])->name('payroll.index');
});

// Tutor only
Route::middleware(['auth', EnsureRole::class . ':tutor'])->group(function () {
    Route::get('my-schedule', [ScheduleController::class, 'index'])->name('schedule.index');
    Route::get('my-attendance', [MyAttendanceController::class, 'index'])->name('my-attendance.index');
    Route::get('my-payroll', [MyPayrollController::class, 'index'])->name('my-payroll.index');
    Route::post('my-payroll/received', [MyPayrollController::class, 'confirmReceived'])->name('my-payroll.received');
    Route::get('votes', [VoteController::class, 'index'])->name('votes.index');
    Route::post('votes', [VoteController::class, 'store'])->name('votes.store');
});

require __DIR__.'/auth.php';