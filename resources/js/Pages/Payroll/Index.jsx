import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const cell = 'px-4 py-3';
const money = (n) =>
    `₱ ${Number(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function TutorRow({ t, showStatus }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <tr className="border-t border-gray-200">
                <td className={`${cell} font-medium`}>{t.name}</td>
                <td className={cell}>
                    {t.category ?? <span className="text-amber-600">No category</span>}
                </td>
                <td className={cell}>{t.rate ? `₱ ${t.rate}` : '—'}</td>
                <td className={`${cell} text-right`}>{t.classes}</td>
                <td className={`${cell} text-right font-semibold`}>{money(t.total)}</td>
                <td className={cell}>
                    {showStatus ? (
                        t.received ? (
                            <>
                                <span className="standing standing-received">Received</span>
                                <span className="ml-2 text-xs text-gray-500">{t.receivedAt}</span>
                            </>
                        ) : (
                            <span className="standing standing-open">Not confirmed yet</span>
                        )
                    ) : (
                        <span className="text-gray-400">—</span>
                    )}
                </td>
                <td className={cell}>
                    <button
                        type="button"
                        onClick={() => setOpen((v) => !v)}
                        aria-expanded={open}
                        className="text-xs font-medium text-[#1a237e] hover:underline"
                    >
                        {open ? 'Hide classes' : 'Show classes'}
                    </button>
                </td>
            </tr>

            {open && (
                <tr className="bg-gray-50">
                    <td colSpan="7" className="px-4 py-3">
                        {t.details.length === 0 ? (
                            <p className="text-sm text-gray-500">
                                No attended classes right now. This tutor confirmed the payment before attendance was
                                changed.
                            </p>
                        ) : (
                            <ul className="space-y-1 text-sm text-gray-700">
                                {t.details.map((d) => (
                                    <li key={d.id}>
                                        {d.date} · {d.school} · {d.time}
                                        {d.replacement && (
                                            <span className="ml-2 text-xs text-green-700">(replacement)</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </td>
                </tr>
            )}
        </>
    );
}

export default function Index({ tutors, summary, periods, range, period }) {
    const { errors } = usePage().props;
    const [from, setFrom] = useState(range.from);
    const [to, setTo] = useState(range.to);
    const missingCategory = tutors.filter((t) => !t.category).length;
    const showStatus = period.standard && period.ended;

    // Keep the date boxes in step when a period button is clicked.
    useEffect(() => {
        setFrom(range.from);
        setTo(range.to);
    }, [range.from, range.to]);

    const apply = (e) => {
        e.preventDefault();
        router.get(route('payroll.index'), { from, to });
    };

    const dateInput =
        'rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]';

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Payroll</h1>
            <p className="mb-4 text-sm text-gray-500">
                Each attended class pays the tutor's category rate. Absent and not-yet-marked classes don't count.
            </p>

            <div className="mb-3 flex flex-wrap gap-2">
                {periods.map((p) => {
                    const active = p.from === range.from && p.to === range.to;

                    return (
                        <Link
                            key={p.from}
                            href={route('payroll.index', { from: p.from, to: p.to })}
                            preserveScroll
                            className={`rounded-full border px-4 py-1 text-sm ${
                                active
                                    ? 'border-[#1a237e] bg-[#1a237e] text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {p.label}
                        </Link>
                    );
                })}
            </div>

            <form onSubmit={apply} className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                <label className="flex items-center gap-2">
                    From
                    <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={dateInput} />
                </label>
                <label className="flex items-center gap-2">
                    To
                    <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={dateInput} />
                </label>
                <button
                    type="submit"
                    className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699]"
                >
                    Apply
                </button>
            </form>

            {(errors.from || errors.to) && (
                <p role="alert" className="mb-3 text-sm text-red-600">
                    {errors.from ?? errors.to}
                </p>
            )}

            <div className="mb-4 grid gap-4 sm:grid-cols-3">
                {[
                    ['Total Classes Attended', summary.classes],
                    ['Total Tutors Paid', summary.tutors],
                    ['Total Amount', money(summary.amount)],
                ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-white p-4 shadow-sm">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="text-2xl font-bold text-[#1a237e]">{value}</p>
                    </div>
                ))}
            </div>

            {showStatus && period.total > 0 && (
                <p className="mb-4 text-sm font-medium text-gray-800">
                    {period.received} of {period.total} {period.total === 1 ? 'tutor has' : 'tutors have'} confirmed
                    receiving their pay for this cutoff. Payout date: {period.payout}.
                </p>
            )}
            {period.standard && !period.ended && (
                <p className="mb-4 text-xs text-gray-500">
                    This cutoff is still running. Tutors can confirm receiving their pay after its last day.
                </p>
            )}
            {!period.standard && (
                <p className="mb-4 text-xs text-gray-500">
                    Custom date range. Pick a cutoff button above to see who confirmed receiving their pay.
                </p>
            )}

            {missingCategory > 0 && (
                <p className="mb-3 rounded bg-amber-50 px-4 py-2 text-sm text-amber-800">
                    {missingCategory} {missingCategory === 1 ? 'tutor has' : 'tutors have'} attended classes but no
                    category, so they are counted at ₱ 0. Set their category on the Tutors page.
                </p>
            )}

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="w-full text-left text-sm text-gray-800">
                    <thead>
                        <tr className="text-gray-700">
                            <th className={`${cell} font-semibold`}>Tutor</th>
                            <th className={`${cell} font-semibold`}>Category</th>
                            <th className={`${cell} font-semibold`}>Rate / Class</th>
                            <th className={`${cell} text-right font-semibold`}>Classes Attended</th>
                            <th className={`${cell} text-right font-semibold`}>Total Pay</th>
                            <th className={`${cell} font-semibold`}>Pay received</th>
                            <th className={cell}>
                                <span className="sr-only">Details</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {tutors.map((t) => (
                            <TutorRow key={t.id} t={t} showStatus={showStatus} />
                        ))}

                        {tutors.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-4 py-8 text-center text-gray-500">
                                    No attended classes in this period. Mark tutors Attended on the Attendance page
                                    and they will show up here.
                                </td>
                            </tr>
                        )}
                    </tbody>
                    {tutors.length > 0 && (
                        <tfoot>
                            <tr className="border-t-2 border-gray-300 font-semibold">
                                <td className={cell} colSpan="3">
                                    Total
                                </td>
                                <td className={`${cell} text-right`}>{summary.classes}</td>
                                <td className={`${cell} text-right`}>{money(summary.amount)}</td>
                                <td className={cell} colSpan="2" />
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </AdminLayout>
    );
}