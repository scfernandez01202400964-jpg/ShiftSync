<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateClassTutorRequest;
use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\Notification;
use App\Models\Tutor;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ClassTutorController extends Controller
{
    // The Attendance page: one day at a time, one card for every class posted on the Classes page.
    public function index(Request $request)
    {
        $this->authorize('viewAny', ClassTutor::class);

        $request->validate(['date' => ['nullable', 'date']]);

        // Same rule as the Classes page, so both open on the same day:
        // the next day with classes (today counts), else the latest day, else today.
        $date = Carbon::parse(
            $request->query('date')
                ?? ClassSession::whereDate('class_date', '>=', today())->min('class_date')
                ?? ClassSession::max('class_date')
                ?? today()
        )->startOfDay();

        $days = ClassSession::selectRaw('DATE(class_date) as day, COUNT(*) as total')
            ->whereDate('class_date', '>=', today()->subDays(14))
            ->groupBy('day')
            ->orderBy('day')
            ->limit(21)
            ->get()
            ->map(fn ($d) => [
                'date' => $d->day,
                'label' => Carbon::parse($d->day)->format('D, M j'),
                'total' => $d->total,
            ]);

        $activeTutors = Tutor::where('status', 'Active')->orderBy('full_name')->get();

        $sessions = ClassSession::whereDate('class_date', $date)
            ->with(['classTutors.tutor', 'votes'])
            ->orderBy('start_time')
            ->get()
            ->map(function ($session) use ($activeTutors) {
                $rows = $session->classTutors;
                $originals = $rows->whereNull('replaced_class_tutor_id')->values();
                $replacements = $rows->whereNotNull('replaced_class_tutor_id')->keyBy('replaced_class_tutor_id');
                $assignedIds = $rows->pluck('tutor_id');
                $voterIds = $session->votes->pluck('tutor_id');

                // Active tutors not already in this class; the ones who voted come first.
                $options = $activeTutors
                    ->reject(fn ($t) => $assignedIds->contains($t->id))
                    ->map(fn ($t) => [
                        'id' => $t->id,
                        'name' => $t->full_name,
                        'voted' => $voterIds->contains($t->id),
                    ])
                    ->sortByDesc('voted')
                    ->values();

                return [
                    'id' => $session->id,
                    'school' => $session->school,
                    'time' => $this->timeRange($session),
                    'needed' => $session->tutors_needed,
                    'assigned' => $originals->count(),
                    'options' => $options,
                    'assignments' => $originals->map(function ($a) use ($replacements) {
                        $rep = $replacements->get($a->id);

                        return [
                            'id' => $a->id,
                            'name' => $a->tutor->full_name,
                            'status' => $a->attendance_status,
                            'replacement' => $rep ? [
                                'id' => $rep->tutor_id,
                                'name' => $rep->tutor->full_name,
                            ] : null,
                        ];
                    }),
                ];
            });

        return Inertia::render('ClassTutors/Index', [
            'sessions' => $sessions,
            'days' => $days,
            'selected' => [
                'date' => $date->toDateString(),
                'label' => $date->format('l, F j, Y'),
            ],
        ]);
    }

    // "Save Attendance" for one class.
    public function record(UpdateClassTutorRequest $request, ClassSession $classSession)
    {
        $rows = $request->validated()['rows'];

        $all = $classSession->classTutors()->get();
        $originals = $all->whereNull('replaced_class_tutor_id');
        $replacements = $all->whereNotNull('replaced_class_tutor_id')->keyBy('replaced_class_tutor_id');

        $activeIds = Tutor::where('status', 'Active')->pluck('id');
        $assignedIds = $originals->pluck('tutor_id');

        $plan = [];
        $errors = [];
        $picked = collect();

        foreach ($rows as $i => $row) {
            $original = $originals->firstWhere('id', $row['id']);

            if (! $original) {
                throw ValidationException::withMessages([
                    'rows' => 'This class changed while you were editing. Reload the page and try again.',
                ]);
            }

            $status = $row['status'];
            $replacementId = $status === 'absent' && ! empty($row['replacement_id'])
                ? (int) $row['replacement_id']
                : null;

            if ($replacementId) {
                $unchanged = (int) $replacements->get($original->id)?->tutor_id === $replacementId;

                if ($assignedIds->contains($replacementId)) {
                    $errors["rows.$i.replacement_id"] = 'That tutor is already assigned to this class.';
                } elseif ($picked->contains($replacementId)) {
                    $errors["rows.$i.replacement_id"] = 'That tutor is already replacing someone else.';
                } elseif (! $unchanged && ! $activeIds->contains($replacementId)) {
                    $errors["rows.$i.replacement_id"] = 'Only active tutors can be chosen.';
                }

                $picked->push($replacementId);
            }

            $plan[] = compact('original', 'status', 'replacementId');
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }

        $when = $classSession->class_date->format('M j, Y') . ', ' . $this->timeRange($classSession);

        DB::transaction(function () use ($plan, $replacements, $classSession, $when) {
            // 1. Save each status, and drop replacements that are no longer wanted.
            foreach ($plan as $item) {
                $item['original']->update(['attendance_status' => $item['status']]);

                $current = $replacements->get($item['original']->id);

                if ($current && (int) $current->tutor_id !== $item['replacementId']) {
                    $current->delete();

                    Notification::create([
                        'user_id' => $current->tutor_id,
                        'title' => 'Replacement removed',
                        'message' => "You are no longer the replacement for {$classSession->school} on {$when}.",
                    ]);
                }
            }

            // 2. Add new replacements. They count as attended, so their class tally goes up.
            foreach ($plan as $item) {
                $replacementId = $item['replacementId'];
                $current = $replacements->get($item['original']->id);
                $keeps = $current && (int) $current->tutor_id === $replacementId;

                if ($replacementId && ! $keeps) {
                    ClassTutor::create([
                        'class_session_id' => $classSession->id,
                        'tutor_id' => $replacementId,
                        'attendance_status' => 'present',
                        'replaced_class_tutor_id' => $item['original']->id,
                    ]);

                    Notification::create([
                        'user_id' => $replacementId,
                        'title' => 'You were chosen as a replacement',
                        'message' => "You were chosen to cover {$classSession->school} on {$when}.",
                    ]);
                }
            }
        });

        return redirect()->back()->with('success', 'Attendance saved.');
    }

    private function timeRange(ClassSession $class): string
    {
        return Carbon::parse($class->start_time)->format('g:i A')
            . ' - ' . Carbon::parse($class->end_time)->format('g:i A');
    }
}