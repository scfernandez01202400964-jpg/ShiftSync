<?php

namespace App\Http\Requests;

use App\Models\ClassSession;
use App\Models\Vote;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;

class StoreVoteRequest extends FormRequest
{
    // Classes a tutor votes for on one day must start at least this many minutes apart.
    public const MIN_GAP_MINUTES = 25;

    public function authorize(): bool
    {
        return $this->user()->can('create', Vote::class);
    }

    public function rules(): array
    {
        return [
            'date' => ['required', 'date', 'after_or_equal:today'],
            // May be empty: that removes the tutor's votes for the day.
            'class_session_ids' => ['present', 'array'],
            'class_session_ids.*' => ['integer', 'distinct'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            if ($this->user()->status !== 'Active') {
                $validator->errors()->add(
                    'class_session_ids',
                    "Your status is {$this->user()->status}, so you can't vote right now."
                );
                return;
            }

            $ids = $this->input('class_session_ids', []);
            $date = Carbon::parse($this->input('date'))->toDateString();
            $classes = ClassSession::whereIn('id', $ids)->get();

            $allOpen = $classes->count() === count($ids)
                && $classes->every(fn ($c) => $c->status === 'proposed' && $c->class_date->toDateString() === $date);

            if (! $allOpen) {
                $validator->errors()->add(
                    'class_session_ids',
                    'One of those classes is no longer open for voting. Reload the page and try again.'
                );
                return;
            }

            // The 25-minute rule.
            $starts = $classes->sortBy('start_time')->values();

            for ($i = 1; $i < $starts->count(); $i++) {
                $gap = (strtotime($starts[$i]->start_time) - strtotime($starts[$i - 1]->start_time)) / 60;

                if ($gap < self::MIN_GAP_MINUTES) {
                    $validator->errors()->add(
                        'class_session_ids',
                        'You can only pick classes that start at least ' . self::MIN_GAP_MINUTES . ' minutes apart.'
                    );
                    return;
                }
            }
        });
    }
}