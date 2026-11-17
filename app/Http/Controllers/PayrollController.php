<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\PayrollReceipt;
use App\Models\Tutor;
use App\Support\Cutoff;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class PayrollController extends Controller
{
    public function index(Request $request)
    {
        // Payroll shows every tutor's pay, so it is admin only (same rule as managing tutors).
        $this->authorize('viewAny', Tutor::class);

        $request->validate([
            'from' => ['nullable', 'date', 'required_with:to'],
            'to' => ['nullable', 'date', 'required_with:from', 'after_or_equal:from'],
        ]);

        [$defaultFrom, $defaultTo] = Cutoff::containing(today());

        $from = Carbon::parse($request->query('from', $defaultFrom))->startOfDay();
        $to = Carbon::parse($request->query('to', $defaultTo))->startOfDay();

        // Tutors who confirmed they received their pay for exactly this cutoff.
        $receipts = PayrollReceipt::where('period_start', $from->toDateString())
            ->where('period_end', $to->toDateString())
            ->get()
            ->keyBy('tutor_id');

        // Every class marked Attended in this period (replacements are saved as Attended too).
        $groups = ClassTutor::query()
            ->where('attendance_status', 'present')
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $from->toDateString())
                ->whereDate('class_date', '<=', $to->toDateString()))
            ->with(['tutor.category', 'classSession'])
            ->get()
            ->groupBy('tutor_id');

        // Also list tutors who confirmed a payment, even if their attendance was edited afterwards.
        $ids = $groups->keys()->merge($receipts->keys())->unique();
        $people = Tutor::with('category')->whereIn('id', $ids)->get()->keyBy('id');

        $tutors = $ids
            ->filter(fn ($id) => $people->has($id))
            ->map(function ($id) use ($groups, $receipts, $people) {
                $tutor = $people->get($id);
                $group = $groups->get($id, collect());
                $receipt = $receipts->get($id);

                $rate = $receipt ? (float) $receipt->rate : (float) ($tutor->category?->rate ?? 0);
                $classes = $receipt ? $receipt->classes : $group->count();

                return [
                    'id' => $tutor->id,
                    'name' => $tutor->full_name,
                    'category' => $tutor->category?->name,
                    'rate' => $rate,
                    'classes' => $classes,
                    'total' => $receipt ? (float) $receipt->amount : $classes * $rate,
                    'received' => $receipt !== null,
                    'receivedAt' => $receipt?->received_at->format('M j, Y'),
                    'details' => $group
                        ->sortBy(fn ($a) => $a->classSession->class_date->toDateString() . ' ' . $a->classSession->start_time)
                        ->map(fn ($a) => [
                            'id' => $a->id,
                            'date' => $a->classSession->class_date->format('M j'),
                            'school' => $a->classSession->school,
                            'time' => $this->timeRange($a->classSession),
                            'replacement' => $a->replaced_class_tutor_id !== null,
                        ])
                        ->values(),
                ];
            })
            ->sortBy('name', SORT_NATURAL | SORT_FLAG_CASE)
            ->values();

        // Buttons for the current cutoff and the five before it.
        $periods = [];
        [$pFrom, $pTo] = Cutoff::containing(today());

        for ($i = 0; $i < 6; $i++) {
            $periods[] = [
                'from' => $pFrom->toDateString(),
                'to' => $pTo->toDateString(),
                'label' => $pFrom->format('M j') . '–' . $pTo->format('j, Y'),
            ];
            [$pFrom, $pTo] = Cutoff::previous($pFrom);
        }

        $standard = Cutoff::isStandard($from, $to);

        return Inertia::render('Payroll/Index', [
            'tutors' => $tutors,
            'summary' => [
                'classes' => $tutors->sum('classes'),
                'tutors' => $tutors->count(),
                'amount' => $tutors->sum('total'),
            ],
            'periods' => $periods,
            'range' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
            ],
            'period' => [
                'standard' => $standard,
                'ended' => $to->lt(today()),
                'received' => $tutors->where('received', true)->count(),
                'total' => $tutors->count(),
                'payout' => $standard ? Cutoff::payoutDate($from)->format('M j, Y') : null,
            ],
        ]);
    }

    private function timeRange(ClassSession $class): string
    {
        return Carbon::parse($class->start_time)->format('g:i A')
            . ' - ' . Carbon::parse($class->end_time)->format('g:i A');
    }
}