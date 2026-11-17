import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm } from '@inertiajs/react';
import { Fragment } from 'react';

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Pending' },
    { value: 'present', label: 'Attended' },
    { value: 'absent', label: 'Absent' },
];

const select = 'w-full rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]';
const cell = 'px-4 py-3';

function ClassHeader({ session, linkLabel }) {
    return (
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-semibold text-[#1a237e]">
                {session.school} · {session.time}
            </h2>
            <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                    {session.assigned} of {session.needed} tutors assigned
                </span>
                <Link
                    href={route('class-sessions.show', session.id)}
                    className="font-medium text-[#1a237e] hover:underline"
                >
                    {linkLabel}
                </Link>
            </div>
        </div>
    );
}

// A class that was posted but has no final tutors yet.
function UnassignedClass({ session }) {
    return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
            <ClassHeader session={session} linkLabel="Choose tutors" />
            <p className="text-sm text-gray-500">
                No tutors assigned yet. Choose the final tutors for this class, then mark attendance here.
            </p>
        </div>
    );
}

function ClassAttendance({ session }) {
    const { data, setData, post, processing, errors } = useForm({
        rows: session.assignments.map((a) => ({
            id: a.id,
            status: a.status,
            replacement_id: a.replacement?.id ?? '',
        })),
    });

    const everyone = [...session.options, ...session.assignments.map((a) => a.replacement).filter(Boolean)];
    const findTutor = (id) => everyone.find((t) => String(t.id) === String(id));

    const setRow = (index, changes) =>
        setData(
            'rows',
            data.rows.map((row, i) => (i === index ? { ...row, ...changes } : row))
        );

    // Replacement choices for one row: free tutors that no other row has picked,
    // plus the tutor already saved for this row.
    const optionsFor = (index) => {
        const takenElsewhere = data.rows
            .filter((_, i) => i !== index)
            .map((row) => String(row.replacement_id));
        const saved = session.assignments[index].replacement;
        const list = session.options.filter((o) => !takenElsewhere.includes(String(o.id)));

        return saved && !takenElsewhere.includes(String(saved.id)) && !list.some((o) => o.id === saved.id)
            ? [saved, ...list]
            : list;
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('class-sessions.attendance', session.id), { preserveScroll: true });
    };

    return (
        <form onSubmit={submit} className="rounded-lg bg-white p-4 shadow-sm">
            <ClassHeader session={session} linkLabel="Change tutors" />

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-800">
                    <thead>
                        <tr className="text-gray-700">
                            {['Tutor Assigned', 'Status', 'If Absent, Replace With'].map((h) => (
                                <th key={h} className={`${cell} font-semibold`}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {session.assignments.map((a, i) => {
                            const row = data.rows[i];
                            const absent = row.status === 'absent';
                            const replacement = absent && row.replacement_id ? findTutor(row.replacement_id) : null;
                            const error = errors[`rows.${i}.replacement_id`] ?? errors[`rows.${i}.status`];

                            return (
                                <Fragment key={a.id}>
                                    <tr className={`border-t border-gray-200 ${absent ? 'bg-red-50 text-red-700' : ''}`}>
                                        <td className={`${cell} font-medium`}>
                                            {a.name}
                                            {absent && (
                                                <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-semibold">
                                                    Absent
                                                </span>
                                            )}
                                        </td>
                                        <td className={cell}>
                                            <select
                                                aria-label={`Status for ${a.name}`}
                                                className={select}
                                                value={row.status}
                                                onChange={(e) =>
                                                    setRow(i, {
                                                        status: e.target.value,
                                                        replacement_id:
                                                            e.target.value === 'absent' ? row.replacement_id : '',
                                                    })
                                                }
                                            >
                                                {STATUS_OPTIONS.map((s) => (
                                                    <option key={s.value} value={s.value}>
                                                        {s.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className={cell}>
                                            {absent ? (
                                                <>
                                                    <select
                                                        aria-label={`Replacement for ${a.name}`}
                                                        className={select}
                                                        value={row.replacement_id}
                                                        onChange={(e) => setRow(i, { replacement_id: e.target.value })}
                                                    >
                                                        <option value="">No replacement</option>
                                                        {optionsFor(i).map((o) => (
                                                            <option key={o.id} value={o.id}>
                                                                {o.name}
                                                                {o.voted ? ' (voted)' : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                                                </>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                    </tr>

                                    {replacement && (
                                        <tr className="bg-green-50 text-green-800">
                                            <td className={`${cell} pl-8`}>
                                                ↳ {replacement.name}
                                                <span className="ml-2 text-xs">replacing {a.name}</span>
                                            </td>
                                            <td className={cell}>Attended</td>
                                            <td className={cell} />
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {errors.rows && <p className="mt-2 text-sm text-red-600">{errors.rows}</p>}

            <div className="mt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-[#4a78b0] px-8 py-2 text-sm font-semibold text-white hover:bg-[#3e6699] disabled:opacity-50"
                >
                    Save Attendance
                </button>
            </div>
        </form>
    );
}

export default function Index({ sessions, days, selected }) {
    const goToDate = (date) => {
        if (date) router.get(route('class-tutors.index'), { date });
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Attendance</h1>
            <p className="mb-4 text-sm text-gray-500">
                Every class posted on the Classes page shows here. Mark each tutor Attended or Absent; attended
                classes count toward payroll.
            </p>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                {days.map((d) => (
                    <Link
                        key={d.date}
                        href={route('class-tutors.index', { date: d.date })}
                        preserveScroll
                        className={`rounded-full border px-4 py-1 text-sm ${
                            d.date === selected.date
                                ? 'border-[#1a237e] bg-[#1a237e] text-white'
                                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        {d.label} <span className="opacity-70">({d.total})</span>
                    </Link>
                ))}

                <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
                    Go to date
                    <input
                        type="date"
                        value={selected.date}
                        onChange={(e) => goToDate(e.target.value)}
                        className="rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]"
                    />
                </label>
            </div>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-[#1a237e]">
                    {selected.label} · {sessions.length} {sessions.length === 1 ? 'class' : 'classes'}
                </p>
                <Link
                    href={route('class-sessions.index', { date: selected.date })}
                    className="text-sm font-medium text-[#1a237e] hover:underline"
                >
                    ← Classes for this day
                </Link>
            </div>

            <div className="space-y-4">
                {sessions.map((session) =>
                    session.assignments.length > 0 ? (
                        <ClassAttendance key={session.id} session={session} />
                    ) : (
                        <UnassignedClass key={session.id} session={session} />
                    )
                )}

                {sessions.length === 0 && (
                    <p className="rounded-lg bg-white px-4 py-8 text-center text-sm text-gray-500 shadow-sm">
                        No classes on this day. Post classes from the Classes page and they will show up here.
                    </p>
                )}
            </div>
        </AdminLayout>
    );
}