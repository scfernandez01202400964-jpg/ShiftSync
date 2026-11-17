<?php

namespace App\Http\Controllers;

use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\Notification;
use App\Models\PayrollReceipt;
use App\Models\User;
use App\Support\Cutoff;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class MyPayrollController extends Controller
{
    private const CUTOFFS_SHOWN = 12;

    // The tutor's own payroll: only their classes, only their pay.
    public function index(Request $request)
    {
        $user = $request->user()->loadMissing('category');
        $rate = (float) ($user->category?->rate ?? 0);
        $today = today();

        // The current cutoff plus the 11 before it, newest first.
        $periods = [];
        [$from, $to] = Cutoff::containing($today);

        for ($i = 0; $i < self::CUTOFFS_SHOWN; $i++) {
            $periods[] = [$from, $to];
            [$from, $to] = Cutoff::previous($from);
        }

        $windowStart = $periods[count($periods) - 1][0];
        $windowEnd = $periods[0][1];

        // Every class this tutor taught or covered in that window (one query).
        $attended = $this->attended($user->id, $windowStart, $windowEnd);

        $receipts = PayrollReceipt::where('tutor_id', $user->id)
            ->where('period_start', '>=', $windowStart->toDateString())
            ->get()
            ->keyBy(fn ($r) => $r->period_start . '|' . $r->period_end);

        $rows = collect($periods)->map(function ($period) use ($attended, $receipts, $rate, $today) {
            [$from, $to] = $period;
            $start = $from->toDateString();
            $end = $to->toDateString();

            $items = $attended
                ->filter(function ($a) use ($start, $end) {
                    $day = $a->classSession->class_date->toDateString();

                    return $day >= $start && $day <= $end;
                })
                ->sortBy(fn ($a) => $a->classSession->class_date->toDateString() . ' ' . $a->classSession->start_time)
                ->values();

            // Once the tutor confirms receiving the pay, the numbers are locked.
            $receipt = $receipts->get($start . '|' . $end);

            return [
                'start' => $start,
                'end' => $end,
                'month' => $from->format('Y-m'),
                'label' => $from->format('M j') . '–' . $to->format('j, Y'),
                'payout' => Cutoff::payoutDate($from)->format('M j, Y'),
                // open (still running) -> ended -> received (you confirmed)
                'status' => $receipt ? 'received' : ($to->lt($today) ? 'ended' : 'open'),
                'receivedAt' => $receipt?->received_at->format('M j, Y'),
                'classes' => $receipt ? $receipt->classes : $items->count(),
                'minutes' => $receipt ? $receipt->minutes : $items->sum(fn ($a) => $this->minutes($a->classSession)),
                'rate' => $receipt ? (float) $receipt->rate : $rate,
                'amount' => $receipt ? (float) $receipt->amount : $items->count() * $rate,
                'details' => $items->map(fn ($a) => [
                    'id' => $a->id,
                    'date' => $a->classSession->class_date->format('M j'),
                    'school' => $a->classSession->school,
                    'time' => $this->timeRange($a->classSession),
                    'minutes' => $this->minutes($a->classSession),
                    'covered' => $a->replaced_class_tutor_id !== null,
                ])->values(),
            ];
        });

        $thisMonth = $rows->where('month', $today->format('Y-m'));

        // Show the running cutoff and every past cutoff that had classes.
        $list = $rows->filter(fn ($r) => $r['status'] === 'open' || $r['classes'] > 0)->values();

        return Inertia::render('MyPayroll/Index', [
            'periods' => $list,
            'waiting' => $list->where('status', 'ended')->count(),
            'summary' => [
                'classes' => (int) $thisMonth->sum('classes'),
                'amount' => (float) $thisMonth->sum('amount'),
                'minutes' => (int) $thisMonth->sum('minutes'),
            ],
            'category' => $user->category
                ? ['name' => $user->category->name, 'rate' => (float) $user->category->rate]
                : null,
            'monthLabel' => $today->format('F Y'),
        ]);
    }

    // "I received this payment": saves a snapshot and notifies every admin.
    public function confirmReceived(Request $request)
    {
        $data = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d'],
        ]);

        $user = $request->user()->loadMissing('category');
        $from = Carbon::createFromFormat('!Y-m-d', $data['from']);
        $to = Carbon::createFromFormat('!Y-m-d', $data['to']);

        if (! Cutoff::isStandard($from, $to) || ! $to->lt(today())) {
            return back()->withErrors(['payment' => 'You can only confirm a full cutoff that has already ended.']);
        }

        // Only this tutor's own classes are ever counted.
        $attended = $this->attended($user->id, $from, $to);

        if ($attended->isEmpty()) {
            return back()->withErrors(['payment' => 'There are no completed classes to be paid in this cutoff.']);
        }

        $rate = (float) ($user->category?->rate ?? 0);

        if ($rate <= 0) {
            return back()->withErrors(['payment' => "You don't have a category yet, so this pay is ₱ 0.00. Ask your admin to set one first."]);
        }

        $receipt = PayrollReceipt::firstOrCreate(
            [
                'tutor_id' => $user->id,
                'period_start' => $from->toDateString(),
                'period_end' => $to->toDateString(),
            ],
            [
                'classes' => $attended->count(),
                'minutes' => $attended->sum(fn ($a) => $this->minutes($a->classSession)),
                'rate' => $rate,
                'amount' => $attended->count() * $rate,
                'received_at' => now(),
            ]
        );

        // Only the first confirmation notifies the admin.
        if ($receipt->wasRecentlyCreated) {
            $label = $from->format('M j') . '–' . $to->format('j, Y');
            $name = $user->full_name ?? $user->name;

            User::where('role', 'admin')->where('status', 'Active')->get()
                ->filter(fn ($admin) => $admin->preferences['in_app_notifications'] ?? true)
                ->each(fn ($admin) => Notification::create([
                    'user_id' => $admin->id,
                    'title' => 'Tutor confirmed pay received',
                    'message' => "{$name} confirmed receiving ₱" . number_format((float) $receipt->amount, 2)
                        . " for {$label}.",
                ]));
        }

        return back()->with(
            'success',
            $receipt->wasRecentlyCreated
                ? 'Thank you! Your admin was notified that you received this payment.'
                : 'You already confirmed this payment.'
        );
    }

    // Classes this tutor taught or covered (attended) between two dates.
    private function attended(int $tutorId, Carbon $from, Carbon $to)
    {
        return ClassTutor::where('tutor_id', $tutorId)
            ->where('attendance_status', 'present')
            ->whereHas('classSession', fn ($q) => $q
                ->whereDate('class_date', '>=', $from->toDateString())
                ->whereDate('class_date', '<=', $to->toDateString()))
            ->with('classSession')
            ->get();
    }

    private function minutes(ClassSession $class): int
    {
        return (int) round(abs(Carbon::parse($class->start_time)->diffInMinutes(Carbon::parse($class->end_time))));
    }

    private function timeRange(ClassSession $class): string
    {
        return Carbon::parse($class->start_time)->format('g:i A')
            . ' - ' . Carbon::parse($class->end_time)->format('g:i A');
    }
}