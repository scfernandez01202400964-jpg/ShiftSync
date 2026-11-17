<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVoteRequest;
use App\Models\ClassSession;
use App\Models\User;
use App\Models\Vote;
use App\Support\Notify;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class VoteController extends Controller
{
    // The Voting page: every upcoming date that still has classes open for voting.
    public function index()
    {
        $this->authorize('create', Vote::class);

        $user = auth()->user();

        $classes = ClassSession::where('status', 'proposed')
            ->whereDate('class_date', '>=', today()->toDateString())
            ->orderBy('class_date')
            ->orderBy('start_time')
            ->get();

        $myVotes = Vote::where('tutor_id', $user->id)
            ->whereIn('class_session_id', $classes->pluck('id'))
            ->pluck('class_session_id');

        $days = $classes
            ->groupBy(fn ($c) => $c->class_date->toDateString())
            ->map(function ($group, $date) use ($myVotes) {
                $slots = $group->map(function ($c) use ($myVotes) {
                    $start = Carbon::parse($c->start_time);

                    return [
                        'id' => $c->id,
                        'school' => $c->school,
                        'time' => $start->format('g:i A'),
                        'start' => $start->format('H:i'),
                        'minutes' => (int) round(abs($start->diffInMinutes(Carbon::parse($c->end_time)))),
                        'needed' => $c->tutors_needed,
                        'voted' => $myVotes->contains($c->id),
                    ];
                })->values();

                return [
                    'date' => $date,
                    'label' => Carbon::parse($date)->format('l, F j, Y'),
                    'voted' => $slots->contains('voted', true),
                    'slots' => $slots,
                ];
            })
            ->values();

        return Inertia::render('Votes/Index', [
            'days' => $days,
            'canVote' => $user->status === 'Active',
            'status' => $user->status,
        ]);
    }

    // "Submit Vote": the picked classes replace this tutor's votes for that day.
    public function store(StoreVoteRequest $request)
    {
        $data = $request->validated();
        $ids = collect($data['class_session_ids'])->map(fn ($id) => (int) $id)->unique()->values();
        $tutor = $request->user();

        // The day's classes still open for voting, and what this tutor had picked before.
        $open = ClassSession::whereDate('class_date', $data['date'])
            ->where('status', 'proposed')
            ->pluck('id');

        $before = Vote::where('tutor_id', $tutor->id)
            ->whereIn('class_session_id', $open)
            ->pluck('class_session_id')
            ->map(fn ($id) => (int) $id);

        DB::transaction(function () use ($open, $ids, $tutor) {
            // Drop votes the tutor un-ticked...
            Vote::where('tutor_id', $tutor->id)
                ->whereIn('class_session_id', $open)
                ->whereNotIn('class_session_id', $ids)
                ->delete();

            // ...and add the new ones.
            foreach ($ids as $id) {
                Vote::firstOrCreate(
                    ['tutor_id' => $tutor->id, 'class_session_id' => $id],
                    ['voted_at' => now()]
                );
            }
        });

        // Tell the admins, but only when this tutor's picks for the day actually changed.
        if ($before->sort()->values()->all() !== $ids->sort()->values()->all()) {
            $this->notifyAdmins($tutor, $data['date'], $ids, $before->isNotEmpty());
        }

        return back()->with(
            'success',
            $ids->isEmpty() ? 'Your votes were removed.' : 'Vote submitted successfully!'
        );
    }

    private function notifyAdmins(User $tutor, string $date, $ids, bool $hadVotes): void
    {
        $name = $tutor->full_name ?? $tutor->name;
        $day = Carbon::parse($date)->format('l, F j, Y');

        if ($ids->isEmpty()) {
            Notify::admins('Tutor removed their votes', "{$name} removed their votes for {$day}.");

            return;
        }

        $picks = ClassSession::whereIn('id', $ids)->orderBy('start_time')->get()
            ->map(fn ($c) => Carbon::parse($c->start_time)->format('g:i A') . ' ' . $c->school)
            ->implode(', ');

        Notify::admins(
            $hadVotes ? 'Tutor updated their votes' : 'Tutor voted',
            "{$name} " . ($hadVotes ? 'updated their votes for' : 'voted for') . " {$day}: {$picks}."
        );
    }
}