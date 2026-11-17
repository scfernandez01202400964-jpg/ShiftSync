<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\Notification;
use App\Models\Vote;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class TutorDashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user()->loadMissing('category');
        $today = today();

        // This tutor's assignments (replacement rows included) inside a date range.
        $between = fn ($from, $to) => ClassTutor::where('tutor_id', $user->id)
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $from->toDateString())
                ->whereDate('class_date', '<=', $to->toDateString()))
            ->with('classSession');

        $todayClasses = $between($today, $today)->get()
            ->sortBy(fn ($a) => $a->classSession->start_time)
            ->values()
            ->map(fn ($a) => [
                'id' => $a->id,
                'school' => $a->classSession->school,
                'time' => $this->timeRange($a->classSession),
                'status' => $a->attendance_status,
            ]);

        // Hours this week: attended classes only.
        $weekMinutes = (int) $between($today->copy()->startOfWeek(), $today->copy()->endOfWeek())
            ->where('attendance_status', 'present')->get()
            ->sum(fn ($a) => $this->minutes($a->classSession));

        // This month: attended classes pay the tutor's category rate (same rule as the admin Payroll page).
        $month = $between($today->copy()->startOfMonth(), $today->copy()->endOfMonth())->get();
        $attended = $month->where('attendance_status', 'present')->count();
        $earnings = $attended * (float) ($user->category?->rate ?? 0);

        // Open dates where this tutor hasn't voted on anything yet.
        $open = ClassSession::where('status', 'proposed')
            ->whereDate('class_date', '>=', $today->toDateString())
            ->get(['id', 'class_date']);

        $votedIds = Vote::where('tutor_id', $user->id)
            ->whereIn('class_session_id', $open->pluck('id'))
            ->pluck('class_session_id');

        $pendingDates = $open
            ->groupBy(fn ($c) => $c->class_date->toDateString())
            ->reject(fn ($group) => $group->pluck('id')->intersect($votedIds)->isNotEmpty())
            ->count();

        $notifications = Notification::where('user_id', $user->id)
            ->latest()->take(5)->get()
            ->map(fn ($n) => [
                'id' => $n->id,
                'title' => $n->title,
                'message' => $n->message,
                'time' => $n->created_at->diffForHumans(),
                'read' => (bool) $n->is_read,
            ]);

        return Inertia::render('Tutor/Dashboard', [
            'stats' => [
                'todayClasses' => $todayClasses->count(),
                'pendingVotes' => $pendingDates,
                'weekHours' => $this->hours($weekMinutes),
                'earnings' => $earnings,
            ],
            'todayLabel' => $today->format('l, F j, Y'),
            'todayClasses' => $todayClasses,
            'attendance' => [
                'attended' => $attended,
                'absent' => $month->where('attendance_status', 'absent')->count(),
                'pending' => $month->where('attendance_status', 'pending')->count(),
            ],
            'notifications' => $notifications,
        ]);
    }

    private function minutes(ClassSession $class): int
    {
        return (int) round(abs(Carbon::parse($class->start_time)->diffInMinutes(Carbon::parse($class->end_time))));
    }

    private function hours(int $minutes): string
    {
        return intdiv($minutes, 60) . 'h ' . ($minutes % 60) . 'm';
    }

    private function timeRange(ClassSession $class): string
    {
        return Carbon::parse($class->start_time)->format('g:i A')
            . ' - ' . Carbon::parse($class->end_time)->format('g:i A');
    }
}