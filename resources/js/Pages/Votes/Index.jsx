import { CalendarIcon, CheckIcon, ChevronRightIcon, ClockIcon } from '@/Components/Icons';
import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const MIN_GAP = 25; // classes you vote for must start at least this many minutes apart

const toMinutes = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
};

const classCount = (n) => `${n} ${n === 1 ? 'class' : 'classes'}`;

function DayButton({ day, selected, submitted, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`flex w-full items-center gap-3 rounded border px-4 py-3 text-left ${
                selected ? 'border-[#1a237e] bg-gray-100' : 'border-gray-300 bg-white hover:bg-gray-50'
            }`}
        >
            {submitted ? (
                <CheckIcon className="h-5 w-5 text-green-600" />
            ) : (
                <CalendarIcon className="h-5 w-5 text-[#1a237e]" />
            )}
            <span className="flex-1">
                <span className="block text-sm font-semibold text-gray-900">{day.label}</span>
                <span className="block text-xs text-gray-600">{classCount(day.slots.length)} to vote on</span>
            </span>
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
        </button>
    );
}

export default function Index({ days, canVote, status }) {
    const { errors } = usePage().props;

    const first = days.find((d) => !d.voted) ?? days[0];
    const [selectedDate, setSelectedDate] = useState(first?.date ?? null);
    const [picked, setPicked] = useState(first ? first.slots.filter((s) => s.voted).map((s) => s.id) : []);
    const [saving, setSaving] = useState(false);

    const day = days.find((d) => d.date === selectedDate) ?? null;
    const available = days.filter((d) => !d.voted);
    const submitted = days.filter((d) => d.voted);
    const error = Object.entries(errors).find(
        ([key]) => key.startsWith('class_session_ids') || key === 'date'
    )?.[1];

    const openDay = (d) => {
        setSelectedDate(d.date);
        setPicked(d.slots.filter((s) => s.voted).map((s) => s.id));
    };

    const toggle = (id) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

    // A class can't be picked if it starts within 25 minutes of one you already picked.
    const clashWith = (slot) =>
        picked.includes(slot.id)
            ? null
            : day.slots.find(
                  (o) => picked.includes(o.id) && Math.abs(toMinutes(o.start) - toMinutes(slot.start)) < MIN_GAP
              ) ?? null;

    const submit = () => {
        router.post(
            route('votes.store'),
            { date: day.date, class_session_ids: picked },
            { preserveScroll: true, onStart: () => setSaving(true), onFinish: () => setSaving(false) }
        );
    };

    const hadVotes = day?.voted ?? false;
    const label = hadVotes ? (picked.length === 0 ? 'Remove my votes' : 'Update Vote') : 'Submit Vote';

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Voting</h1>
            <p className="mb-4 text-sm text-gray-500">Select your preferred schedule options.</p>

            {!canVote && (
                <p role="status" className="mb-4 rounded bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    Your status is {status}, so you can't vote right now. Ask your admin to set you back to Active.
                </p>
            )}

            {days.length === 0 ? (
                <p className="rounded-lg bg-white px-4 py-10 text-center text-sm text-gray-500 shadow-sm">
                    No classes are open for voting right now. Check back after your admin posts new classes.
                </p>
            ) : (
                <div className="grid items-start gap-4 lg:grid-cols-[1fr_1.1fr]">
                    <div className="space-y-4">
                        <section className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-[#1a237e]">Available for Voting</h2>
                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                    Open
                                </span>
                            </div>
                            <p className="mb-3 text-xs text-gray-500">Select dates to view and vote on schedule options</p>
                            <div className="space-y-2">
                                {available.map((d) => (
                                    <DayButton
                                        key={d.date}
                                        day={d}
                                        selected={d.date === selectedDate}
                                        onClick={() => openDay(d)}
                                    />
                                ))}
                                {available.length === 0 && (
                                    <p className="py-2 text-sm text-gray-500">You've voted on every open date.</p>
                                )}
                            </div>
                        </section>

                        <section className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center gap-2">
                                <h2 className="font-semibold text-[#1a237e]">Votes Submitted</h2>
                                <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">
                                    Submitted
                                </span>
                            </div>
                            <p className="mb-3 text-xs text-gray-500">Your preferences have been recorded</p>
                            <div className="space-y-2">
                                {submitted.map((d) => (
                                    <DayButton
                                        key={d.date}
                                        day={d}
                                        submitted
                                        selected={d.date === selectedDate}
                                        onClick={() => openDay(d)}
                                    />
                                ))}
                                {submitted.length === 0 && (
                                    <p className="py-2 text-sm text-gray-500">You haven't voted on any dates yet.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    <section className="rounded-lg bg-white p-5 shadow-sm">
                        {day ? (
                            <>
                                <h2 className="font-semibold text-[#1a237e]">{day.label}</h2>
                                <p className="mb-3 text-xs text-gray-500">
                                    Select your preferred time slots (multiple selections allowed). Classes you pick
                                    must start at least {MIN_GAP} minutes apart.
                                </p>

                                <ul className="space-y-3">
                                    {day.slots.map((s) => {
                                        const clash = clashWith(s);
                                        const checked = picked.includes(s.id);
                                        const disabled = !canVote || Boolean(clash);

                                        return (
                                            <li key={s.id}>
                                                <label
                                                    className={`flex items-center gap-3 rounded border p-3 ${
                                                        checked ? 'border-[#1a237e] bg-gray-100' : 'border-gray-200'
                                                    } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                                                >
                                                    <ClockIcon className="h-5 w-5 shrink-0 text-[#5b4fd1]" />
                                                    <span className="flex-1">
                                                        <span className="flex items-center gap-2">
                                                            <span className="text-lg font-bold text-gray-900">
                                                                {s.time}
                                                            </span>
                                                            <span className="rounded border border-gray-300 px-1.5 text-xs text-gray-700">
                                                                {s.minutes} minutes
                                                            </span>
                                                        </span>
                                                        <span className="block text-sm font-medium text-gray-800">
                                                            {s.school}
                                                        </span>
                                                        <span className="block text-xs text-gray-500">
                                                            {s.needed} {s.needed === 1 ? 'tutor' : 'tutors'} needed
                                                        </span>
                                                    </span>
                                                    <input
                                                        type="checkbox"
                                                        checked={checked}
                                                        disabled={disabled}
                                                        onChange={() => toggle(s.id)}
                                                        aria-label={`${s.time} at ${s.school}`}
                                                        className="h-5 w-5 rounded-full border-gray-400 text-[#1a237e] focus:ring-[#1a237e]"
                                                    />
                                                </label>
                                                {clash && (
                                                    <p className="mt-1 pl-1 text-xs text-amber-600">
                                                        Starts within {MIN_GAP} minutes of your {clash.time} pick.
                                                    </p>
                                                )}
                                            </li>
                                        );
                                    })}
                                </ul>

                                {error && (
                                    <p role="alert" className="mt-3 text-sm text-red-600">
                                        {error}
                                    </p>
                                )}

                                <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-3">
                                    <p className="text-xs text-gray-600">
                                        {picked.length} {picked.length === 1 ? 'option' : 'options'} selected
                                    </p>
                                    <button
                                        type="button"
                                        onClick={submit}
                                        disabled={saving || !canVote || (picked.length === 0 && !hadVotes)}
                                        className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699] disabled:opacity-50"
                                    >
                                        {saving ? 'Saving…' : label}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <p className="py-10 text-center text-sm text-gray-500">
                                Choose a date on the left to see its time slots.
                            </p>
                        )}
                    </section>
                </div>
            )}
        </AppLayout>
    );
}