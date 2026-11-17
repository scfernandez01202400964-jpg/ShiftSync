import { Link } from '@inertiajs/react';

const input = 'mt-1 w-full rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]';

export default function CategoryForm({ form, onSubmit }) {
    const { data, setData, processing, errors } = form;

    return (
        <form onSubmit={onSubmit} className="max-w-xl rounded-lg bg-white p-6 shadow-sm">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Category name</label>
                    <input
                        className={input}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        placeholder="Tier 4"
                    />
                    {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Rate per class (₱)</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={input}
                        value={data.rate}
                        onChange={(e) => setData('rate', e.target.value)}
                    />
                    {errors.rate && <p className="mt-1 text-xs text-red-600">{errors.rate}</p>}
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Link
                    href={route('categories.index')}
                    className="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699] disabled:opacity-50"
                >
                    Save Category
                </button>
            </div>
        </form>
    );
}