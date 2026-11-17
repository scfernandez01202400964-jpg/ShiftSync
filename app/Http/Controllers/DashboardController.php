<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use App\Models\Vote;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
                   // Tutors get their own dashboard (more cards come in the next part).
           if ($request->user()->role !== 'admin') {
               $open = ClassSession::where('status', 'proposed')
                   ->whereDate('class_date', '>=', today()->toDateString())
                   ->get(['id', 'class_date']);

               $votedIds = Vote::where('tutor_id', $request->user()->id)
                   ->whereIn('class_session_id', $open->pluck('id'))
                   ->pluck('class_session_id');

               // Open dates where the tutor hasn't voted on anything yet.
               $pendingDates = $open
                   ->groupBy(fn ($c) => $c->class_date->toDateString())
                   ->reject(fn ($group) => $group->pluck('id')->intersect($votedIds)->isNotEmpty())
                   ->count();

               return Inertia::render('Tutor/Dashboard', ['pendingDates' => $pendingDates]);
           }

        $today = today();

        // Tutors by status (the Tutor model only ever counts role = tutor).
        $status = Tutor::selectRaw('status, COUNT(*) as total')->groupBy('status')->pluck('total', 'status');

        // Upcoming classes that still have no final tutors chosen.
        $pendingVotes = ClassSession::where('status', 'proposed')
            ->whereDate('class_date', '>=', $today->toDateString())
            ->count();

        // Payroll this month: every Attended class pays the tutor's category rate (same rule as the Payroll page).
        $payroll = ClassTutor::where('attendance_status', 'present')
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $today->copy()->startOfMonth()->toDateString())
                ->whereDate('class_date', '<=', $today->copy()->endOfMonth()->toDateString()))
            ->with('tutor.category')
            ->get()
            ->sum(fn ($a) => (float) ($a->tutor->category?->rate ?? 0));

        // Today's classes with their tutors. Absent tutors stay in the list.
        $todayClasses = ClassSession::whereDate('class_date', $today->toDateString())
            ->with('classTutors.tutor')
            ->orderBy('start_time')
            ->get()
            ->map(function ($session) {
                $rows = $session->classTutors;
                $replacements = $rows->whereNotNull('replaced_class_tutor_id')->keyBy('replaced_class_tutor_id');

                return [
                    'id' => $session->id,
                    'school' => $session->school,
                    'time' => $this->timeRange($session),
                    'tutors' => $rows->whereNull('replaced_class_tutor_id')->values()->map(fn ($a) => [
                        'id' => $a->id,
                        'name' => $a->tutor->full_name,
                        'status' => $a->attendance_status,
                        'replacement' => $replacements->get($a->id)?->tutor->full_name,
                    ]),
                ];
            });

        $absentToday = $todayClasses->sum(fn ($c) => $c['tutors']->where('status', 'absent')->count());

        // Attendance overview: % of assigned tutors who attended, per weekday this week.
        $week = ClassTutor::whereNull('replaced_class_tutor_id')
            ->whereIn('attendance_status', ['present', 'absent'])
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $today->copy()->startOfWeek()->toDateString())
                ->whereDate('class_date', '<=', $today->copy()->endOfWeek()->toDateString()))
            ->with('classSession')
            ->get()
            ->groupBy(fn ($a) => $a->classSession->class_date->dayOfWeekIso);

        $attendanceWeek = collect(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'])
            ->map(function ($day, $i) use ($week) {
                $group = $week->get($i + 1);
                $marked = $group ? $group->count() : 0;
                $present = $group ? $group->where('attendance_status', 'present')->count() : 0;

                return [
                    'day' => $day,
                    'rate' => $marked ? (int) round($present / $marked * 100) : null,
                    'present' => $present,
                    'marked' => $marked,
                ];
            })
            ->values();

        // Recent activity: each publish creates several class rows in the same minute, so group them.
        $activity = ClassSession::latest()->take(100)->get()
            ->groupBy(fn ($c) => $c->created_at->format('Y-m-d H:i'))
            ->take(5)
            ->map(function ($group) {
                $dates = $group->map(fn ($c) => $c->class_date->format('M j'))->unique();
                $count = $group->count();

                return [
                    'title' => 'New Proposal Created',
                    'detail' => $count . ($count === 1 ? ' class' : ' classes')
                        . ' for ' . ($dates->count() === 1 ? $dates->first() : 'several dates'),
                    'time' => $group->first()->created_at->format('M j, Y g:i A'),
                ];
            })
            ->values();

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'tutors' => [
                    'total' => (int) $status->sum(),
                    'active' => (int) $status->get('Active', 0),
                    'onLeave' => (int) $status->get('On Leave', 0),
                    'inactive' => (int) $status->get('Inactive', 0),
                ],
                'pendingVotes' => $pendingVotes,
                'todayClasses' => $todayClasses->count(),
                'absentToday' => $absentToday,
                'payrollThisMonth' => $payroll,
                'todayDate' => $today->toDateString(),
            ],
            'todayLabel' => $today->format('l, F j, Y'),
            'todayClasses' => $todayClasses,
            'attendanceWeek' => $attendanceWeek,
            'activity' => $activity,
        ]);
    }

    private function timeRange(ClassSession $class): string
    {
        return Carbon::parse($class->start_time)->format('g:i A')
            . ' - ' . Carbon::parse($class->end_time)->format('g:i A');
    }
}