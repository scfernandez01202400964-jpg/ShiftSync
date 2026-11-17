import AppLayout from '@/Layouts/AppLayout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

const STATUS = { open: 'In progress', ended: 'Ended', received: 'Received' };

const peso = (n) =>
    `₱ ${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const hm = (m) => `${Math.floor(m / 60)}h ${m % 60}m`;
const classCount = (n) => `${n} ${n === 1 ? 'class' : 'classes'}`;

function Card({ label, value }) {
    return (
        <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-3xl font-bold text-[#1a237e]">{value}</p>
        </div>
    );
}

// The tutor confirms the money arrived. This notifies the admin.
function ConfirmReceived({ p }) {
    const confirmIt = () => {
        if (confirm(`Confirm that you received ${peso(p.amount)} for ${p.label}? Your admin will be notified.`)) {
            router.post(route('my-payroll.received'), { from: p.start, to: p.end }, { preserveScroll: true });
        }
    };

    return (
        <button
            type="button"
            onClick={confirmIt}
            className="rounded bg-[#4a78b0] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#3e6699]"
        >
            I received this payment
        </button>
    );
}

function PeriodCard({ p, startOpen }) {
    const [open, setOpen] = useState(startOpen);

    return (
        <li className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="text-left">
                    <span className="block font-semibold text-[#1a237e]">{p.label} Cutoff</span>
                    <span className="block text-xs text-gray-500">
                        Payout date: {p.payout} · {open ? 'Hide' : 'Show'} classes
                    </span>
                </button>

                <div className="flex flex-wrap items-center gap-3">
                    <span className={`standing standing-${p.status}`}>{STATUS[p.status]}</span>
                    {p.status === 'ended' && p.classes > 0 && <ConfirmReceived p={p} />}
                    <span className="text-lg font-bold text-[#1a237e]">{peso(p.amount)}</span>
                </div>
            </div>

            {open && (
                <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-700">
                    {p.classes === 0 ? (
                        <p>No completed or covered classes in this cutoff yet.</p>
                    ) : (
                        <>
                            <p className="font-medium text-gray-900">
                                {classCount(p.classes)} × {peso(p.rate)} = {peso(p.amount)}
                            </p>
                            <p className="text-xs text-gray-500">{hm(p.minutes)} taught in total</p>

                            {p.details.length > 0 && (
                                <ul className="mt-3 divide-y divide-gray-100">
                                    {p.details.map((d) => (
                                        <li key={d.id} className="flex flex-wrap justify-between gap-2 py-2">
                                            <span>
                                                {d.date} · {d.school}
                                                {d.covered && (
                                                    <span className="standing standing-covered ml-2">Covered</span>
                                                )}
                                            </span>
                                            <span className="text-gray-500">
                                                {d.time} · {d.minutes} min
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}

                    {p.status === 'open' && (
                        <p className="mt-3 text-xs text-gray-500">
                            This cutoff is still running. The total grows as classes are marked completed or covered.
                        </p>
                    )}
                    {p.status === 'ended' && p.classes > 0 && (
                        <p className="mt-3 text-xs text-gray-500">
                            This cutoff has ended. Click "I received this payment" once the money reaches you, and
                            your admin will be notified.
                        </p>
                    )}
                    {p.status === 'received' && (
                        <p className="mt-3 text-xs text-gray-500">
                            You confirmed receiving this payment on {p.receivedAt}. These numbers are locked.
                        </p>
                    )}
                </div>
            )}
        </li>
    );
}

export default function Index({ periods, waiting, summary, category, monthLabel }) {
    const { errors } = usePage().props;

    return (
        <AppLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Payroll</h1>
            <p className="mb-4 text-sm text-gray-500">Track your earnings and payment history.</p>

            {category ? (
                <p className="mb-4 text-sm text-gray-700">
                    Your category is <span className="font-semibold">{category.name}</span>, so every class you
                    complete or cover pays <span className="font-semibold">{peso(category.rate)}</span>. Absent and
                    pending classes don't count.
                </p>
            ) : (
                <p role="status" className="mb-4 rounded bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    You don't have a category yet, so your classes count at ₱ 0.00. Ask your admin to set one.
                </p>
            )}

            {waiting > 0 && (
                <p role="status" className="mb-4 rounded bg-amber-50 px-4 py-2 text-sm font-medium text-amber-800">
                    {waiting === 1
                        ? 'You have 1 ended cutoff to confirm.'
                        : `You have ${waiting} ended cutoffs to confirm.`}{' '}
                    Click "I received this payment" once your pay reaches you.
                </p>
            )}

            {errors.payment && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                    {errors.payment}
                </p>
            )}

            <p className="mb-2 text-xs text-gray-500">{monthLabel} so far</p>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Card label="Total Classes" value={summary.classes} />
                <Card label="Earnings" value={peso(summary.amount)} />
                <Card label="Minutes worked" value={summary.minutes} />
                <Card label="Total hours" value={hm(summary.minutes)} />
            </div>

            <h2 className="mb-1 font-semibold text-[#1a237e]">Payment Schedule</h2>
            <p className="mb-3 text-xs text-gray-500">
                Open a cutoff to see exactly which classes were counted and how the total was worked out.
            </p>
            <ul className="space-y-3">
                {periods.map((p, i) => (
                    <PeriodCard key={p.start} p={p} startOpen={i === 0 || p.status === 'ended'} />
                ))}
            </ul>
        </AppLayout>
    );
}