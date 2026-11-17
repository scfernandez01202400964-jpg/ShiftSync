import { PencilIcon, SearchIcon, TrashIcon } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

const statusColor = {
    Active: 'text-gray-800',
    'On Leave': 'text-amber-600',
    Inactive: 'text-red-600',
};

// Laravel labels pages "&laquo; Previous" / "Next &raquo;"; the design uses < and >.
const pageLabel = (label) =>
    label.includes('Previous') ? '<' : label.includes('Next') ? '>' : label;

const pageBox = 'flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm';

export default function Index({ tutors, filters }) {
    const [search, setSearch] = useState(filters.search);

    // Search as the admin types, after a short pause.
    useEffect(() => {
        if (search === filters.search) return;

        const timer = setTimeout(() => {
            router.get(route('tutors.index'), { search }, { preserveState: true, replace: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    const remove = (tutor) => {
        if (confirm(`Remove ${tutor.full_name}? This can't be undone.`)) {
            router.delete(route('tutors.destroy', tutor.id));
        }
    };

    return (
        <AdminLayout>
            <div className="mb-4 flex items-start justify-between">
                <h1 className="text-2xl font-bold text-[#1a237e]">Tutors</h1>
                <Link
                    href={route('tutors.create')}
                    className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699]"
                >
                    Add Tutor +
                </Link>
            </div>

            <label className="mb-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-400">
                <SearchIcon />
                <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search Tutor"
                    className="w-full border-0 bg-transparent p-0 text-sm text-gray-800 placeholder-gray-400 focus:ring-0"
                />
            </label>

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="w-full text-left text-sm text-[#1a237e]">
                    <thead>
                        <tr className="text-gray-700">
                            {['Username', 'Name', 'Category', 'Rate / Class', 'Status', 'Action'].map((h) => (
                                <th key={h} className="px-4 py-3 font-semibold">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {tutors.data.map((t) => (
                            <tr key={t.id} className="border-t border-gray-200">
                                <td className="px-4 py-3">{t.username}</td>
                                <td className="px-4 py-3">{t.full_name}</td>
                                <td className="px-4 py-3">{t.category ?? '—'}</td>
                                <td className="px-4 py-3">{t.rate ? `₱ ${Number(t.rate)}` : '—'}</td>
                                <td className={`px-4 py-3 ${statusColor[t.status]}`}>{t.status}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <Link
                                            href={route('tutors.edit', t.id)}
                                            title={`Edit ${t.full_name}`}
                                            aria-label={`Edit ${t.full_name}`}
                                            className="hover:text-[#1a237e]"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => remove(t)}
                                            title={`Delete ${t.full_name}`}
                                            aria-label={`Delete ${t.full_name}`}
                                            className="hover:text-red-600"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {tutors.data.length === 0 && (
                            <tr>
                                <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                                    {filters.search
                                        ? 'No tutors match that search.'
                                        : 'No tutors yet. Use Add Tutor to create the first account.'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {tutors.last_page > 1 && (
                <div className="mt-4 flex justify-center gap-2">
                    {tutors.links
                        .filter((l) => l.url || !/Previous|Next/.test(l.label))
                        .map((l, i) =>
                            l.url ? (
                                <Link
                                    key={i}
                                    href={l.url}
                                    preserveScroll
                                    className={`${pageBox} ${
                                        l.active
                                            ? 'border-[#1a237e] bg-[#1a237e] text-white'
                                            : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-100'
                                    }`}
                                >
                                    {pageLabel(l.label)}
                                </Link>
                            ) : (
                                <span key={i} className={`${pageBox} border-transparent text-gray-400`}>
                                    {l.label}
                                </span>
                            )
                        )}
                </div>
            )}
        </AdminLayout>
    );
}