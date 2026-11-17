<?php

namespace App\Http\Controllers;

use App\Models\ClassTutor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    // The tutor's calendar: only classes the admin assigned to this tutor.
    public function index(Request $request)
    {
        $param = (string) $request->query('month', '');

        $month = preg_match('/^(19|20)\d{2}-(0[1-9]|1[0-2])$/', $param)
            ? Carbon::createFromFormat('!Y-m', $param)
            : today()->startOfMonth();

        // The calendar shows whole weeks, so load the days around the month too.
        $from = $month->copy()->startOfWeek();
        $to = $month->copy()->endOfMonth()->endOfWeek();

        $events = ClassTutor::where('tutor_id', $request->user()->id)
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $from->toDateString())
                ->whereDate('class_date', '<=', $to->toDateString()))
            ->with('classSession')
            ->get()
            ->sortBy(fn ($a) => $a->classSession->class_date->toDateString() . ' ' . $a->classSession->start_time)
            ->values()
            ->map(function ($a) {
                $class = $a->classSession;
                $start = Carbon::parse($class->start_time);
                $end = Carbon::parse($class->end_time);

                return [
                    'id' => $a->id,
                    'date' => $class->class_date->toDateString(),
                    'school' => $class->school,
                    'start' => $start->format('g:i A'),
                    'time' => $start->format('g:i A') . ' - ' . $end->format('g:i A'),
                    'minutes' => (int) round(abs($start->diffInMinutes($end))),
                    'needed' => $class->tutors_needed,
                    'status' => $a->attendance_status,
                    'replacement' => $a->replaced_class_tutor_id !== null,
                ];
            });

        return Inertia::render('Schedule/Index', [
            'events' => $events,
            'month' => [
                'value' => $month->format('Y-m'),
                'label' => $month->format('F Y'),
                'prev' => $month->copy()->subMonth()->format('Y-m'),
                'next' => $month->copy()->addMonth()->format('Y-m'),
            ],
            'today' => today()->toDateString(),
        ]);
    }
}