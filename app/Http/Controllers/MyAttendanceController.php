<?php

namespace App\Http\Controllers;

use App\Models\ClassTutor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class MyAttendanceController extends Controller
{
    // The tutor's attendance record: only classes the admin assigned to this tutor.
    public function index(Request $request)
    {
        $param = (string) $request->query('month', '');

        $month = preg_match('/^(19|20)\d{2}-(0[1-9]|1[0-2])$/', $param)
            ? Carbon::createFromFormat('!Y-m', $param)
            : today()->startOfMonth();

        $records = ClassTutor::where('tutor_id', $request->user()->id)
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $month->copy()->startOfMonth()->toDateString())
                ->whereDate('class_date', '<=', $month->copy()->endOfMonth()->toDateString()))
            ->with('classSession')
            ->get()
            ->sortByDesc(fn ($a) => $a->classSession->class_date->toDateString() . ' ' . $a->classSession->start_time)
            ->values()
            ->map(function ($a) {
                $class = $a->classSession;
                $start = Carbon::parse($class->start_time);
                $end = Carbon::parse($class->end_time);

                return [
                    'id' => $a->id,
                    'date' => $class->class_date->format('M j, Y'),
                    'school' => $class->school,
                    'time' => $start->format('g:i A') . ' - ' . $end->format('g:i A'),
                    'minutes' => (int) round(abs($start->diffInMinutes($end))),
                    'standing' => $this->standing($a),
                ];
            });

        $counts = $records->countBy('standing');
        $paid = $records->whereIn('standing', ['complete', 'covered']);
        $minutes = (int) $paid->sum('minutes');

        return Inertia::render('MyAttendance/Index', [
            'records' => $records,
            'summary' => [
                'completed' => $paid->count(),
                'covered' => $counts->get('covered', 0),
                'absent' => $counts->get('absent', 0),
                'pending' => $counts->get('pending', 0),
                'minutes' => $minutes,
                'hours' => intdiv($minutes, 60) . 'h ' . ($minutes % 60) . 'm',
            ],
            'month' => [
                'value' => $month->format('Y-m'),
                'label' => $month->format('F Y'),
                'prev' => $month->copy()->subMonth()->format('Y-m'),
                'next' => $month->copy()->addMonth()->format('Y-m'),
            ],
        ]);
    }

    // pending / complete / absent / covered.
    // "Covered": this tutor was brought in to replace an absent tutor.
    private function standing(ClassTutor $a): string
    {
        if ($a->attendance_status === 'present') {
            return $a->replaced_class_tutor_id !== null ? 'covered' : 'complete';
        }

        return $a->attendance_status === 'absent' ? 'absent' : 'pending';
    }
}