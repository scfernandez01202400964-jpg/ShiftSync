import { PencilIcon, TrashIcon } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';

const shortTime = (time) => time.replace(/\s?(AM|PM)/g, (_, p) => p.toLowerCase());

const cell = 'border border-gray-300 px-3 py-2';

export default function Index({ classes, days, selected }) {
    const remove = (c) => {
        if (confirm(`Remove the ${shortTime(c.time)} class at ${c.school} on ${c.date}?`)) {
            router.delete(route('class-sessions.destroy', c.id));
        }
    };

    const goToDate = (date) => {
        if (date) router.get(route('class-sessions.index'), { date });
    };

    return (
        <AdminLayout>
            <h1 className="mb-4 text-2xl font-bold text-[#1a237e]">Classes</h1>

            <div className="mb-4 flex flex-wrap items-center gap-3">
                <Link
                    href={route('class-sessions.create')}
                    className="rounded bg-[#4a78b0] px-8 py-2 text-sm font-semibold text-white hover:bg-[#3e6699]"
                >
                    Create
                </Link>

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

            {days.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                    {days.map((d) => (
                        <Link
                            key={d.date}
                            href={route('class-sessions.index', { date: d.date })}
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
                </div>
            )}

            <div className="rounded-lg bg-white p-4 shadow-sm">
                               <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                   <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-[#1a237e]">
                        {selected.label} · {classes.length} {classes.length === 1 ? 'class' : 'classes'}
                    </p>
                    <Link
                        href={route('class-tutors.index', { date: selected.date })}
                        className="text-sm font-medium text-[#1a237e] hover:underline"
                    >
                        Take attendance for this day →
                    </Link>
                </div>
                    <Link
                        href={route('class-tutors.index', { date: selected.date })}
                        className="text-sm font-medium text-[#1a237e] hover:underline"
                    >
                        Take attendance for this day →
                    </Link>
                </div>

                {classes.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm text-gray-800">
                            <thead>
                                <tr className="bg-gray-100 text-left uppercase">
                                    <th className={cell}>School</th>
                                    <th className={cell}>Time Slot</th>
                                    <th className={`${cell} text-right`}>Tutor Need</th>
                                    <th className={`${cell} w-20`}>
                                        <span className="sr-only">Actions</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {classes.map((c) => (
                                    <tr key={c.id}>
                                        <td className={cell}>{c.school}</td>
                                            <td className={cell}>
                                            <Link
                                                href={route('class-sessions.show', c.id)}
                                                title="See who voted and choose the tutors"
                                                className="font-medium text-[#1a237e] hover:underline"
                                            >
                                                {shortTime(c.time)}
                                            </Link>
                                        </td>
                                        <td className={`${cell} text-right`}>{c.needed}</td>
                                        <td className={cell}>
                                            <div className="flex items-center gap-3">
                                                <Link
                                                    href={route('class-sessions.edit', c.id)}
                                                    title="Edit class"
                                                    aria-label={`Edit the ${shortTime(c.time)} class at ${c.school}`}
                                                    className="hover:text-[#1a237e]"
                                                >
                                                    <PencilIcon className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    onClick={() => remove(c)}
                                                    title="Delete class"
                                                    aria-label={`Delete the ${shortTime(c.time)} class at ${c.school}`}
                                                    className="hover:text-red-600"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="py-8 text-center text-sm text-gray-500">
                        No classes on this day. Use Create to post some.
                    </p>
                )}
            </div>
        </AdminLayout>
    );
}