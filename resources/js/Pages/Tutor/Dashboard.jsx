import AppLayout from '@/Layouts/AppLayout';
import { Link, usePage } from '@inertiajs/react';

const peso = (n) =>
    `₱ ${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const statusText = { present: 'Attended', absent: 'Absent', pending: '' };

// Draws a link only when that page exists, so a page that isn't built yet can never break the Dashboard.
function PageLink({ to, children, className }) {
    if (!route().has(to)) return null;

    return (
        <Link href={route(to)} className={className}>
            {children}
        </Link>
    );
}

function StatCard({ label, value, note, children }) {
    return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[#1a237e]">{value}</p>
            {note && <p className="mt-1 text-xs text-gray-500">{note}</p>}
            {children}
        </div>
    );
}

function Panel({ title, footer, children }) {
    return (
        <section className="flex min-h-[18rem] flex-col rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-[#1a237e]">{title}</h2>
            <div className="mt-3 flex-1">{children}</div>
            {footer && <div className="mt-3 text-right text-xs">{footer}</div>}
        </section>
    );
}

const viewAll = 'font-medium text-[#1b5e20] hover:underline';
const smallLink = 'mt-1 inline-block text-xs font-medium text-[#1a237e] hover:underline';

export default function Dashboard({ stats, todayLabel, todayClasses, attendance, notifications }) {
    const { auth } = usePage().props;
    const name = auth.user.full_name ?? auth.user.name;

    const summary = [
        ['Attended', attendance.attended, 'text-green-700'],
        ['Absent', attendance.absent, 'text-red-700'],
        ['Not yet marked', attendance.pending, 'text-gray-700'],
    ];

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Dashboard</h1>
            <p className="mb-4 text-sm text-gray-500">Hello, {name}! Here's your overview.</p>

            <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Today's Classes" value={stats.todayClasses} note={todayLabel} />
                <StatCard label="Pending Votes" value={stats.pendingVotes} note="Days waiting for your vote">
                    {stats.pendingVotes > 0 && (
                        <PageLink to="votes.index" className={smallLink}>
                            Go to Voting →
                        </PageLink>
                    )}
                </StatCard>
                <StatCard label="Total Hours (This Week)" value={stats.weekHours} note="Attended classes only" />
                <StatCard
                    label="Total Earnings"
                    value={peso(stats.earnings)}
                    note="This month · attended classes × your category rate"
                >
                    <PageLink to="my-payroll.index" className={smallLink}>
                        See how it's counted →
                    </PageLink>
                </StatCard>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Panel
                    title="Today's Schedule"
                    footer={
                        <PageLink to="schedule.index" className={viewAll}>
                            View All
                        </PageLink>
                    }
                >
                    {todayClasses.length === 0 ? (
                        <p className="text-sm text-gray-500">No classes today.</p>
                    ) : (
                        <ul className="space-y-2">
                            {todayClasses.map((c) => (
                                <li
                                    key={c.id}
                                    className={`rounded border px-3 py-2 text-sm ${
                                        c.status === 'pending' ? 'border-gray-200 text-gray-800' : `tone-${c.status}`
                                    }`}
                                >
                                    <p className="font-medium">{c.school}</p>
                                    <p className="text-xs">
                                        {c.time}
                                        {statusText[c.status] && ` · ${statusText[c.status]}`}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel title="Recent Notifications">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No notifications yet. You'll see a message here when the admin chooses you for a class.
                        </p>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {notifications.map((n) => (
                                <li key={n.id} className="py-2">
                                    <p className="text-sm font-medium text-gray-800">
                                        {!n.read && (
                                            <span
                                                aria-hidden="true"
                                                className="mr-2 inline-block h-2 w-2 rounded-full bg-[#1a237e]"
                                            />
                                        )}
                                        {n.title}
                                        {!n.read && <span className="sr-only"> (unread)</span>}
                                    </p>
                                    <p className="text-xs text-gray-600">{n.message}</p>
                                    <p className="text-xs text-gray-400">{n.time}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel
                    title="Attendance Summary"
                    footer={
                        <PageLink to="my-attendance.index" className={viewAll}>
                            View All
                        </PageLink>
                    }
                >
                    <p className="mb-2 text-xs text-gray-500">This month</p>
                    <dl>
                        {summary.map(([label, count, color]) => (
                            <div
                                key={label}
                                className="flex items-center justify-between border-b border-gray-200 py-2 text-sm"
                            >
                                <dt className="text-gray-700">{label}</dt>
                                <dd className={`font-semibold ${color}`}>{count}</dd>
                            </div>
                        ))}
                    </dl>
                </Panel>
            </div>
        </AppLayout>
    );
}