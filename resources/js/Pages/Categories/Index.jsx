import { PencilIcon, TrashIcon } from '@/Components/Icons';
import Pagination from '@/Components/Pagination';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';

export default function Index({ categories }) {
    const remove = (category) => {
        if (confirm(`Remove ${category.name}? Tutors in this category will be left without one.`)) {
            router.delete(route('categories.destroy', category.id));
        }
    };

    return (
        <AdminLayout>
            <div className="mb-4 flex items-start justify-between">
                <h1 className="text-2xl font-bold text-[#1a237e]">Categories</h1>
                <Link
                    href={route('categories.create')}
                    className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699]"
                >
                    Add Category +
                </Link>
            </div>

            <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                <table className="w-full text-left text-sm text-[#1a237e]">
                    <thead>
                        <tr className="text-gray-700">
                            {['Name', 'Rate / Class', 'Action'].map((h) => (
                                <th key={h} className="px-4 py-3 font-semibold">
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {categories.data.map((c) => (
                            <tr key={c.id} className="border-t border-gray-200">
                                <td className="px-4 py-3">{c.name}</td>
                                <td className="px-4 py-3">₱ {Number(c.rate)}</td>
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3 text-gray-800">
                                        <Link
                                            href={route('categories.edit', c.id)}
                                            title={`Edit ${c.name}`}
                                            aria-label={`Edit ${c.name}`}
                                            className="hover:text-[#1a237e]"
                                        >
                                            <PencilIcon className="h-4 w-4" />
                                        </Link>
                                        <button
                                            onClick={() => remove(c)}
                                            title={`Delete ${c.name}`}
                                            aria-label={`Delete ${c.name}`}
                                            className="hover:text-red-600"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {categories.data.length === 0 && (
                            <tr>
                                <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                                    No categories yet. Use Add Category to create the first tier.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Pagination paginator={categories} />
        </AdminLayout>
    );
}