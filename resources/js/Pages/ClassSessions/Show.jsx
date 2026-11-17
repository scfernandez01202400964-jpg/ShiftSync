import { UserIcon } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

export default function Show({ classSession, voters, assigned }) {
    const { data, setData, post, processing, errors } = useForm({ tutor_ids: assigned });

    const chosen = data.tutor_ids.length;
    const full = chosen >= classSession.needed;
    const error =
        errors.tutor_ids ?? Object.entries(errors).find(([key]) => key.startsWith('tutor_ids.'))?.[1];

    const toggle = (id) =>
        setData(
            'tutor_ids',
            data.tutor_ids.includes(id) ? data.tutor_ids.filter((t) => t !== id) : [...data.tutor_ids, id]
        );

    const submit = (e) => {
        e.preventDefault();
        post(route('class-sessions.assign', classSession.id));
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">View Class Proposal</h1>
            <Link
                href={route('class-sessions.index', { date: classSession.day })}
                className="mb-4 inline-block text-sm text-gray-500 hover:underline"
            >
                ← Back to Classes
            </Link>

            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm sm:grid-cols-4">
                {[
                    ['School', classSession.school],
                    ['Date', classSession.date],
                    ['Time Slot', classSession.time],
                    ['Slot', `${chosen} / ${classSession.needed}`],
                ].map(([label, value]) => (
                    <div key={label}>
                        <p className="font-semibold text-gray-900">{label}</p>
                        <p className="text-gray-600">{value}</p>
                    </div>
                ))}
            </div>

            <form onSubmit={submit}>
                <div className="mb-2 flex items-center justify-between text-sm font-medium text-gray-800">
                    <p>Tutors who voted for this class ({voters.length})</p>
                    <p>
                        Selected ({chosen}/{classSession.needed})
                    </p>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                    <table className="w-full text-left text-sm text-gray-800">
                        <thead>
                            <tr className="text-gray-700">
                                {['Select', 'Tutor Name', 'Category', 'Rate / Class'].map((h) => (
                                    <th key={h} className="px-4 py-3 font-semibold">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {voters.map((v) => {
                                const checked = data.tutor_ids.includes(v.id);
                                const unavailable = v.status !== 'Active';
                                const disabled = !checked && (full || unavailable);

                                return (
                                    <tr key={v.id} className="border-t border-gray-200">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={disabled}
                                                onChange={() => toggle(v.id)}
                                                aria-label={`Select ${v.name}`}
                                                className="h-5 w-5 rounded border-gray-300 text-[#1a237e] focus:ring-[#1a237e] disabled:opacity-40"
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2b5f9e] text-white">
                                                    <UserIcon className="h-5 w-5" />
                                                </span>
                                                {v.name}
                                                {unavailable && (
                                                    <span className="text-xs text-amber-600">{v.status}</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{v.category ?? '—'}</td>
                                        <td className="px-4 py-3">{v.rate ? `₱ ${Number(v.rate)}` : '—'}</td>
                                    </tr>
                                );
                            })}

                            {voters.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="px-4 py-8 text-center text-gray-500">
                                        No tutors have voted for this class yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

                <div className="mt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={processing || voters.length === 0}
                        className="rounded bg-[#4a78b0] px-8 py-2 text-sm font-semibold text-white hover:bg-[#3e6699] disabled:opacity-50"
                    >
                        Confirm Selection
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}