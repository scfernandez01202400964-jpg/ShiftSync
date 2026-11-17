import AppLayout from '@/Layouts/AppLayout';
import { Link } from '@inertiajs/react';

const LABEL = {
    complete: 'Complete',
    pending: 'Pending',
    absent: 'Absent',
    covered: 'Covered',
};

const MEANING = [
    ['Pending', "your admin hasn't marked this class yet."],
    ['Complete', 'you taught your assigned class.'],
    ['Absent', 'you were marked absent, so it does not count toward pay.'],
    ['Covered', 'you stepped in for a tutor who was absent. It counts toward your pay.'],
];

const cell = 'px-4 py-3';
const monthLink = 'rounded px-3 py-1 text-lg text-gray-700 hover:bg-gray-100';

function Card({ label, value, note }) {
    return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[#1a237e]">{value}</p>
            {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
        </div>
    );
}

export default function Index({ records, summary, month }) {
    return (
        <AppLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Attendance</h1>
            <p className="mb-4 text-sm text-gray-500">
                Your official schedule: the classes your admin assigned to you, and how each one stands.
            </p>

            <div className="mb-4 flex items-center gap-3">
                <Link
                    href={route('my-attendance.index', { month: month.prev })}
                    preserveScroll
                    aria-label="Previous month"
                    className={monthLink}
                >
                    &lt;
                </Link>
                <h2 className="min-w-[9rem] text-center font-semibold text-[#1a237e]">{month.label}</h2>
                <Link
                    href={route('my-attendance.index', { month: month.next })}
                    preserveScroll
                    aria-label="Next month"
                    className={monthLink}
                >
                    &gt;
                </Link>
                <Link
                    href={route('my-attendance.index')}
                    className="ml-2 text-xs font-medium text-[#1a237e] hover:underline"
                >
                    This month
                </Link>
            </div>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card
                    label="Completed"
                    value={summary.completed}
                    note={summary.covered > 0 ? `Includes ${summary.covered} covered` : null}
                />
                <Card label="Absences" value={summary.absent} />
                <Card label="Minutes worked" value={summary.minutes} />
                <Card label="Total hours" value={summary.hours} />
            </div>

            <p className="mb-2 text-sm font-semibold text-[#1a237e]">
                Attendance Records · {records.length} {records.length === 1 ? 'class' : 'classes'}
                {summary.pending > 0 && ` · ${summary.pending} pending`}
            </p>

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-800">
                    <thead>
                        <tr className="text-gray-700">
                            {['Date', 'School', 'Time', 'Duration', 'Status'].map((h) => (
                                <th key={h} className={`${cell} font-semibold`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {records.map((r) => (
                            <tr key={r.id} className="border-t border-gray-200">
                                <td className={cell}>{r.date}</td>
                                <td className={cell}>{r.school}</td>
                                <td className={cell}>{r.time}</td>
                                <td className={cell}>{r.minutes} min</td>
                                <td className={cell}>
                                    <span className={`standing standing-${r.standing}`}>{LABEL[r.standing]}</span>
                                </td>
                            </tr>
                        ))}

                        {records.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                                    No classes assigned to you in {month.label}. Classes show up here after your
                                    admin chooses you from the votes.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <ul className="mt-4 space-y-1 text-xs text-gray-600">
                {MEANING.map(([name, text]) => (
                    <li key={name}>
                        <span className="font-semibold">{name}:</span> {text}
                    </li>
                ))}
            </ul>
        </AppLayout>
    );
}