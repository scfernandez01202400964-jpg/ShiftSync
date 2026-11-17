import { Link } from '@inertiajs/react';

const input = 'mt-1 w-full rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]';
const STATUSES = ['Active', 'On Leave', 'Inactive'];

function Field({ label, error, hint, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {children}
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function TutorForm({ form, categories, onSubmit, editing = false }) {
    const { data, setData, processing, errors } = form;

    return (
        <form onSubmit={onSubmit} className="rounded-lg bg-white p-6 shadow-sm">
            <div className="grid gap-x-8 gap-y-4 md:grid-cols-2">
                <div className="space-y-4">
                    <Field label="Username" error={errors.username}>
                        <input
                            className={input}
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                        />
                    </Field>
                    <Field label="Full Name" error={errors.full_name}>
                        <input
                            className={input}
                            value={data.full_name}
                            onChange={(e) => setData('full_name', e.target.value)}
                        />
                    </Field>
                    <Field label="Category" error={errors.category_id}>
                        <select
                            className={input}
                            value={data.category_id}
                            onChange={(e) => setData('category_id', e.target.value)}
                        >
                            {categories.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} (₱{Number(c.rate)} per class)
                                </option>
                            ))}
                        </select>
                    </Field>
                    
                </div>

                <div className="space-y-4">
                    <Field
                        label="Password"
                        error={errors.password}
                        hint={editing ? 'Leave blank to keep the current password.' : undefined}
                    >
                        <input
                            type="password"
                            autoComplete="new-password"
                            className={input}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                        />
                    </Field>
                    <Field label="Confirm Password">
                        <input
                            type="password"
                            autoComplete="new-password"
                            className={input}
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                        />
                    </Field>
                    <Field label="Status" error={errors.status}>
                        <select
                            className={input}
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            {STATUSES.map((s) => (
                                <option key={s}>{s}</option>
                            ))}
                        </select>
                    </Field>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
                <Link
                    href={route('tutors.index')}
                    className="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={processing}
                    className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699] disabled:opacity-50"
                >
                    Save Tutor
                </button>
            </div>
        </form>
    );
}