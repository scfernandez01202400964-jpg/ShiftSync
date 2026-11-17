<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreClassSessionRequest;
use App\Http\Requests\UpdateClassSessionRequest;
use App\Models\ClassSession;
use App\Models\ClassTutor;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Models\Tutor;
use Inertia\Inertia;

class ClassSessionController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('viewAny', ClassSession::class);

        $request->validate(['date' => ['nullable', 'date']]);

        // Default to the next day that has classes, else the latest day, else today.
        $date = Carbon::parse(
            $request->query('date')
                ?? ClassSession::whereDate('class_date', '>=', today())->min('class_date')
                ?? ClassSession::max('class_date')
                ?? today()
        )->startOfDay();

        $classes = ClassSession::withCount('classTutors')
            ->whereDate('class_date', $date)
            ->orderBy('start_time')
            ->get()
            ->map(fn ($c) => [
                'id' => $c->id,
                'school' => $c->school,
                'date' => $c->class_date->format('M j Y'),
                'time' => $this->timeRange($c),
                'assigned' => $c->class_tutors_count,
                'needed' => $c->tutors_needed,
            ]);

        // The day buttons: days with classes, from a week ago onward.
        $days = ClassSession::selectRaw('DATE(class_date) as day, COUNT(*) as total')
            ->whereDate('class_date', '>=', today()->subDays(7))
            ->groupBy('day')
            ->orderBy('day')
            ->limit(14)
            ->get()
            ->map(fn ($d) => [
                'date' => $d->day,
                'label' => Carbon::parse($d->day)->format('D, M j'),
                'total' => $d->total,
            ]);

        return Inertia::render('ClassSessions/Index', [
            'classes' => $classes,
            'days' => $days,
            'selected' => [
                'date' => $date->toDateString(),
                'label' => $date->format('l, F j, Y'),
            ],
        ]);
    }

    // The "View Class Proposal" screen: who voted, and who is assigned.
    public function show(ClassSession $classSession)
    {
        // Admin only: this screen shows voters and their pay rates.
        $this->authorize('update', $classSession);

        $voters = $classSession->votes()
            ->with('tutor.category')
            ->orderBy('voted_at')
            ->get()
            ->map(fn ($vote) => [
                'id' => (int) $vote->tutor_id,
                'name' => $vote->tutor->full_name,
                'status' => $vote->tutor->status,
                'category' => $vote->tutor->category?->name,
                'rate' => $vote->tutor->category?->rate,
            ]);

        $assigned = $classSession->classTutors()
            ->whereNull('replaced_class_tutor_id')
            ->pluck('tutor_id')
            ->map(fn ($id) => (int) $id)
            ->values();

        return Inertia::render('ClassSessions/Show', [
            'classSession' => [
                'id' => $classSession->id,
                'school' => $classSession->school,
                'day' => $classSession->class_date->toDateString(),
                'date' => $classSession->class_date->format('M j Y'),
                'time' => $this->timeRange($classSession),
                'needed' => $classSession->tutors_needed,
            ],
            'voters' => $voters,
            'assigned' => $assigned,
        ]);
    }

    // "Confirm Selection": save the final tutors for this class and notify them.
    public function assign(Request $request, ClassSession $classSession)
    {
        $this->authorize('update', $classSession);

        $data = $request->validate([
            'tutor_ids' => ['present', 'array', 'max:' . $classSession->tutors_needed],
            'tutor_ids.*' => [
                'integer',
                Rule::exists('votes', 'tutor_id')->where('class_session_id', $classSession->id),
            ],
        ], [
            'tutor_ids.max' => "You can choose up to {$classSession->tutors_needed} tutors for this class.",
            'tutor_ids.*.exists' => 'You can only choose tutors who voted for this class.',
        ]);

        $selected = collect($data['tutor_ids'])->unique();

        $existing = $classSession->classTutors()->whereNull('replaced_class_tutor_id')->get();

        // Only drop assignments that don't have attendance recorded yet.
        $removed = $existing->where('attendance_status', 'pending')->whereNotIn('tutor_id', $selected->all());
        $added = $selected->diff($existing->pluck('tutor_id'));

        $when = $classSession->class_date->format('M j, Y') . ', ' . $this->timeRange($classSession);

        DB::transaction(function () use ($classSession, $removed, $added, $when) {
            foreach ($removed as $assignment) {
                $assignment->delete();

                Notification::create([
                    'user_id' => $assignment->tutor_id,
                    'title' => 'Class assignment removed',
                    'message' => "You are no longer assigned to {$classSession->school} on {$when}.",
                ]);
            }

            foreach ($added as $tutorId) {
                ClassTutor::create([
                    'class_session_id' => $classSession->id,
                    'tutor_id' => $tutorId,
                ]);

                Notification::create([
                    'user_id' => $tutorId,
                    'title' => 'You were chosen for a class',
                    'message' => "You were chosen to teach at {$classSession->school} on {$when}.",
                ]);
            }

            $hasTutors = $classSession->classTutors()->whereNull('replaced_class_tutor_id')->exists();
            $classSession->update(['status' => $hasTutors ? 'finalized' : 'proposed']);
        });

        return redirect()
            ->route('class-sessions.show', $classSession)
            ->with('success', 'Selection of tutors confirmed successfully!');
    }

    public function create()
    {
        $this->authorize('create', ClassSession::class);

        return Inertia::render('ClassSessions/Create');
    }

    // One proposal is one date with several classes; each row becomes its own class.
        // One proposal is one date with several classes; each row becomes its own class.
       public function store(StoreClassSessionRequest $request)
       {
           $data = $request->validated();

           foreach ($data['classes'] as $class) {
               ClassSession::create([
                   'school' => $class['school'],
                   'class_date' => $data['class_date'],
                   'tutors_needed' => $class['tutors_needed'],
                   'start_time' => $class['start_time'],
                   'end_time' => $class['end_time'],
                   'created_by' => auth()->id(),
               ]);
           }

           $this->notifyVotingOpen($data['class_date'], count($data['classes']));

           return redirect()
               ->route('class-sessions.index', ['date' => $data['class_date']])
               ->with('success', 'Class published successfully!');
       }

       // "Voting reminders: when new voting opens." Tells every active tutor who has that switch on.
       private function notifyVotingOpen(string $date, int $count): void
       {
           $label = Carbon::parse($date)->format('l, F j, Y');
           $classes = $count === 1 ? '1 class is' : "{$count} classes are";

           Tutor::where('status', 'Active')->get()
               ->filter(fn ($t) => ($t->preferences['voting_reminders'] ?? true)
                   && ($t->preferences['in_app_notifications'] ?? true))
               ->each(fn ($t) => Notification::create([
                   'user_id' => $t->id,
                   'title' => 'New classes open for voting',
                   'message' => "{$classes} open for voting on {$label}.",
               ]));
       }

    public function edit(ClassSession $classSession)
    {
        $this->authorize('update', $classSession);

        return Inertia::render('ClassSessions/Update', [
            'classSession' => [
                'id' => $classSession->id,
                'school' => $classSession->school,
                'class_date' => $classSession->class_date->format('Y-m-d'),
                'start_time' => substr($classSession->start_time, 0, 5),
                'end_time' => substr($classSession->end_time, 0, 5),
                'tutors_needed' => $classSession->tutors_needed,
                'status' => $classSession->status,
            ],
        ]);
    }

    public function update(UpdateClassSessionRequest $request, ClassSession $classSession)
    {
        $classSession->update($request->validated());

        return redirect()
            ->route('class-sessions.index', ['date' => $classSession->class_date->toDateString()])
            ->with('success', 'Class updated successfully!');
    }

    public function destroy(ClassSession $classSession)
    {
        $this->authorize('delete', $classSession);

        $date = $classSession->class_date->toDateString();
        $classSession->delete();

        return redirect()
            ->route('class-sessions.index', ['date' => $date])
            ->with('success', 'Class removed.');
    }

    private function timeRange(ClassSession $class): string
    {
        return Carbon::parse($class->start_time)->format('g:i A')
            . ' - ' . Carbon::parse($class->end_time)->format('g:i A');
    }
}