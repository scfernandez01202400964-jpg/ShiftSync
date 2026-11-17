import { ClockIcon, UserIcon } from '@/Components/Icons';
import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const STATUS = {
    present: { label: 'Attended', chip: 'chip-present' },
    pending: { label: 'Not yet marked', chip: 'chip-pending' },
    absent: { label: 'Absent', chip: 'chip-absent' },
};

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseKey = (key) => {
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d);
};
const formatKey = (key, options) => parseKey(key).toLocaleDateString('en-US', options);

// Whole weeks, Monday first, covering the month.
function buildGrid(monthValue) {
    const [year, month] = monthValue.split('-').map(Number);
    const offset = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const weeks = Math.ceil((offset + new Date(year, month, 0).getDate()) / 7);

    return Array.from({ length: weeks * 7 }, (_, i) => {
        const d = new Date(year, month - 1, 1 - offset + i);
        return { key: keyOf(d), day: d.getDate(), outside: d.getMonth() !== month - 1 };
    });
}

function Calendar({ events, month, today }) {
    const grid = useMemo(() => buildGrid(month.value), [month.value]);

    const byDate = useMemo(() => {
        const map = {};
        events.forEach((e) => {
            if (!map[e.date]) map[e.date] = [];
            map[e.date].push(e);
        });
        return map;
    }, [events]);

    // Start on today when it is in this month, else the first day with a class, else the 1st.
    const [selected, setSelected] = useState(() => {
        if (today.startsWith(month.value)) return today;
        return events.find((e) => e.date.startsWith(month.value))?.date ?? `${month.value}-01`;
    });

    const dayEvents = byDate[selected] ?? [];
    const navButton = 'rounded px-3 py-1 text-lg text-gray-700 hover:bg-gray-100';

    return (
        <div className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
            <section className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-center gap-3">
                    <Link
                        href={route('schedule.index', { month: month.prev })}
                        preserveScroll
                        aria-label="Previous month"
                        className={navButton}
                    >
                        &lt;
                    </Link>
                    <h2 className="min-w-[10rem] text-center font-semibold text-[#1a237e]">{month.label}</h2>
                    <Link
                        href={route('schedule.index', { month: month.next })}
                        preserveScroll
                        aria-label="Next month"
                        className={navButton}
                    >
                        &gt;
                    </Link>
                    <Link
                        href={route('schedule.index')}
                        className="ml-2 text-xs font-medium text-[#1a237e] hover:underline"
                    >
                        Today
                    </Link>
                </div>

                <div className="overflow-x-auto">
                    <div className="min-w-[40rem]">
                        <div className="grid grid-cols-7 border-b border-gray-200 text-center text-xs font-medium text-gray-500">
                            {WEEKDAYS.map((d) => (
                                <div key={d} className="py-2">
                                    {d}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7">
                            {grid.map((cell) => {
                                const list = byDate[cell.key] ?? [];
                                const isSelected = cell.key === selected;
                                const isToday = cell.key === today;

                                return (
                                    <button
                                        key={cell.key}
                                        type="button"
                                        onClick={() => setSelected(cell.key)}
                                        aria-pressed={isSelected}
                                        aria-label={`${formatKey(cell.key, {
                                            month: 'long',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}, ${list.length} ${list.length === 1 ? 'class' : 'classes'}`}
                                        className={`flex min-h-[5.5rem] flex-col items-stretch gap-1 border p-1 text-left ${
                                            isSelected
                                                ? 'border-[#1a237e] bg-gray-100'
                                                : 'border-gray-200 bg-white hover:bg-gray-50'
                                        } ${cell.outside ? 'opacity-50' : ''}`}
                                    >
                                        <span
                                            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                                                isToday ? 'bg-[#1a237e] font-bold text-white' : 'text-gray-700'
                                            }`}
                                        >
                                            {cell.day}
                                        </span>
                                        {list.slice(0, 2).map((e) => (
                                            <span
                                                key={e.id}
                                                className={`block truncate rounded px-1 text-[10px] leading-4 text-white ${STATUS[e.status].chip}`}
                                            >
                                                {e.start} {e.school}
                                            </span>
                                        ))}
                                        {list.length > 2 && (
                                            <span className="text-[10px] text-gray-500">+{list.length - 2} more</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>

            <aside className="rounded-lg bg-white p-4 shadow-sm">
                <h2 className="text-center font-semibold text-[#1a237e]">
                    {formatKey(selected, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h2>
                <p className="mb-3 text-center text-xs text-[#1b5e20]">
                    {dayEvents.length} {dayEvents.length === 1 ? 'class' : 'classes'} scheduled
                </p>

                {dayEvents.length === 0 ? (
                    <p className="py-6 text-center text-sm text-gray-500">No classes on this day.</p>
                ) : (
                    <ul className="space-y-3">
                        {dayEvents.map((e) => (
                            <li key={e.id} className={`rounded-lg border p-3 tone-${e.status}`}>
                                <p className="font-semibold">
                                    {e.school}
                                    {e.replacement && (
                                        <span className="ml-2 text-xs font-normal">(replacement)</span>
                                    )}
                                </p>
                                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                                    <span className="flex items-center gap-1">
                                        <ClockIcon className="h-4 w-4" /> {e.time}
                                    </span>
                                    <span>Duration: {e.minutes} minutes</span>
                                </div>
                                <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="h-4 w-4" /> {e.needed} {e.needed === 1 ? 'slot' : 'slots'}
                                    </span>
                                    <span className="font-semibold">{STATUS[e.status].label}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                        
               {/* GAgo pala ehh zFLEX WRAP CHANGE */ }


                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-gray-200 pt-3 text-xs text-gray-600">
                    {Object.values(STATUS).map((s) => (
                        <li key={s.label} className="flex items-center gap-1">
                            <span className={`h-2.5 w-2.5 rounded-full ${s.chip}`} />
                            {s.label}
                        </li>
                    ))}
                </ul>
            </aside>
        </div>
    );
}

export default function Index({ events, month, today }) {
    return (
        <AppLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">My Schedule</h1>
            <p className="mb-4 text-sm text-gray-500">Classes your admin has assigned to you.</p>

            {/* The key resets the selected day when you move to another month. */}
            <Calendar key={month.value} events={events} month={month} today={today} />
        </AppLayout>
    );
}