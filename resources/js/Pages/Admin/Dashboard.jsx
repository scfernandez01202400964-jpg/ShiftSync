import AdminLayout from '@/Layouts/AdminLayout';
import { Link, usePage } from '@inertiajs/react';

const peso = (n) =>
    `₱ ${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const chip = {
    present: 'border-green-200 bg-green-50 text-green-800',
    pending: 'border-gray-200 bg-gray-50 text-gray-700',
    absent: 'border-red-200 bg-red-50 text-red-700',
};
const statusLabel = { present: 'Attended', pending: 'Pending', absent: 'Absent' };

function StatCard({ label, value, note }) {
    return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[#1a237e]">{value}</p>
            {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
        </div>
    );
}

function AttendanceChart({ data }) {
    const W = 560;
    const H = 220;
    const L = 36;
    const R = 12;
    const T = 12;
    const B = 28;
    const x = (i) => L + ((W - L - R) / (data.length - 1)) * i;
    const y = (v) => T + (H - T - B) * (1 - v / 100);

    // Break the line wherever a day has no marked attendance.
    const segments = [];
    let run = [];
    data.forEach((d, i) => {
        if (d.rate === null) {
            if (run.length) segments.push(run);
            run = [];
        } else {
            run.push([x(i), y(d.rate)]);
        }
    });
    if (run.length) segments.push(run);

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label="Attendance rate for each day of this week"
            className="w-full"
        >
            {[0, 25, 50, 75, 100].map((v) => (
                <g key={v}>
                    <line x1={L} x2={W - R} y1={y(v)} y2={y(v)} stroke="#e5e7eb" />
                    <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#6b7280">
                        {v}
                    </text>
                </g>
            ))}
            {data.map((d, i) => (
                <text key={d.day} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#6b7280">
                    {d.day}
                </text>
            ))}
            {segments
                .filter((s) => s.length > 1)
                .map((s, i) => (
                    <polyline
                        key={i}
                        points={s.map((p) => p.join(',')).join(' ')}
                        fill="none"
                        stroke="#1a237e"
                        strokeWidth="2"
                    />
                ))}
            {data.map(
                (d, i) =>
                    d.rate !== null && (
                        <circle key={d.day} cx={x(i)} cy={y(d.rate)} r="4" fill="#fff" stroke="#1a237e" strokeWidth="2">
                            <title>{`${d.day}: ${d.rate}% (${d.present} of ${d.marked} attended)`}</title>
                        </circle>
                    )
            )}
        </svg>
    );
}

export default function Dashboard({ stats, todayLabel, todayClasses, attendanceWeek, activity }) {
    const { auth } = usePage().props;
    const name = auth.user.full_name ?? auth.user.name;
    const hasAttendance = attendanceWeek.some((d) => d.rate !== null);

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Dashboard</h1>
            <p className="mb-4 text-sm text-gray-500">Hello, {name}! Here's your overview.</p>

            {stats.absentToday > 0 && (
                <a
                    href="#today"
                    className="mb-4 block rounded border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700"
                >
                    {stats.absentToday} {stats.absentToday === 1 ? 'tutor is' : 'tutors are'} absent today. See
                    Today's Classes below.
                </a>
            )}

            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    label="Total Tutors"
                    value={stats.tutors.total}
                    note={`${stats.tutors.active} active · ${stats.tutors.onLeave} on leave · ${stats.tutors.inactive} inactive`}
                />
                <StatCard
                    label="Pending Votes"
                    value={stats.pendingVotes}
                    note="Upcoming classes still waiting for final tutors"
                />
                <StatCard label="Today's Classes" value={stats.todayClasses} note={todayLabel} />
                <StatCard
                    label="Payroll this Month"
                    value={peso(stats.payrollThisMonth)}
                    note="Attended classes × category rate"
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
                <section className="rounded-lg bg-white p-5 shadow-sm">
                    <h2 className="font-semibold text-[#1a237e]">Attendance Overview</h2>
                    <p className="mb-3 text-xs text-gray-500">
                        Share of assigned tutors who attended, by day this week (%)
                    </p>
                    {hasAttendance ? (
                        <AttendanceChart data={attendanceWeek} />
                    ) : (
                        <p className="py-10 text-center text-sm text-gray-500">
                            No attendance marked yet this week.
                        </p>
                    )}
                </section>

                <section className="rounded-lg bg-white p-5 shadow-sm">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="font-semibold text-[#1a237e]">Recent Activity</h2>
                        <Link href={route('class-sessions.index')} className="text-xs text-gray-500 hover:underline">
                            View All
                        </Link>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {activity.map((a, i) => (
                            <li key={i} className="py-2">
                                <p className="text-sm font-medium text-gray-800">{a.title}</p>
                                <p className="text-xs text-gray-500">{a.detail}</p>
                                <p className="text-xs text-gray-400">{a.time}</p>
                            </li>
                        ))}
                    </ul>
                    {activity.length === 0 && <p className="py-4 text-sm text-gray-500">No activity yet.</p>}
                </section>
            </div>

            <section id="today" className="mt-4 rounded-lg bg-white p-5 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-semibold text-[#1a237e]">Today's Classes · {todayLabel}</h2>
                    <Link
                        href={route('class-tutors.index', { date: stats.todayDate })}
                        className="text-sm font-medium text-[#1a237e] hover:underline"
                    >
                        Take attendance →
                    </Link>
                </div>

                {todayClasses.length === 0 ? (
                    <p className="py-4 text-sm text-gray-500">No classes today.</p>
                ) : (
                    <div className="space-y-3">
                        {todayClasses.map((c) => (
                            <div key={c.id} className="rounded border border-gray-200 p-3">
                                <p className="text-sm font-semibold text-gray-900">
                                    {c.school} · {c.time}
                                </p>

                                {c.tutors.length === 0 ? (
                                    <p className="mt-1 text-sm text-gray-500">No tutors assigned yet.</p>
                                ) : (
                                    <ul className="mt-2 flex flex-wrap gap-2">
                                        {c.tutors.map((t) => (
                                            <li
                                                key={t.id}
                                                className={`rounded border px-3 py-1 text-sm ${chip[t.status]}`}
                                            >
                                                <span className="font-medium">{t.name}</span> · {statusLabel[t.status]}
                                                {t.status === 'absent' &&
                                                    (t.replacement ? (
                                                        <span className="ml-2 text-green-700">
                                                            Replaced by {t.replacement}
                                                        </span>
                                                    ) : (
                                                        <span className="ml-2 font-semibold">No replacement yet</span>
                                                    ))}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </AdminLayout>
    );
}