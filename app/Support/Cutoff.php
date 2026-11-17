<?php

namespace App\Support;

use Illuminate\Support\Carbon;

class Cutoff
{
    // Two cutoffs a month: the 1st to the 15th, and the 16th to the end of the month.
    public static function containing(Carbon $day): array
    {
        $start = $day->copy()->startOfMonth();

        return $day->day <= 15
            ? [$start, $start->copy()->addDays(14)]
            : [$start->copy()->addDays(15), $day->copy()->endOfMonth()->startOfDay()];
    }

    // The cutoff right before the one that starts on $from.
    public static function previous(Carbon $from): array
    {
        return self::containing($from->copy()->subDay());
    }

    // 1st-15th is paid on the 20th; 16th-end is paid on the 5th of the next month (as in your Figma).
    // To change the payout days, change the numbers here.
    public static function payoutDate(Carbon $from): Carbon
    {
        return $from->day === 1
            ? $from->copy()->startOfMonth()->addDays(19)
            : $from->copy()->addMonthNoOverflow()->startOfMonth()->addDays(4);
    }

    // True only for a full cutoff, not a custom date range.
    public static function isStandard(Carbon $from, Carbon $to): bool
    {
        [$start, $end] = self::containing($from);

        return $start->isSameDay($from) && $end->isSameDay($to);
    }
}