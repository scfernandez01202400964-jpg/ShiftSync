import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

const input = 'mt-1 w-full rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]';

function Field({ label, error, children }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">{label}</label>
            {children}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

export default function Update({ classSession }) {
    const { data, setData, put, processing, errors } = useForm({
        school: classSession.school,
        class_date: classSession.class_date,
        start_time: classSession.start_time,
        end_time: classSession.end_time,
        tutors_needed: classSession.tutors_needed,
        status: classSession.status,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('class-sessions.update', classSession.id));
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Edit Class</h1>
            <Link
                href={route('class-sessions.index')}
                className="mb-4 inline-block text-sm text-gray-500 hover:underline"
            >
                ← Back to Classes
            </Link>

            <form onSubmit={submit} className="max-w-2xl space-y-4 rounded-lg bg-white p-6 shadow-sm">
                <Field label="School Name" error={errors.school}>
                    <input
                        className={input}
                        value={data.school}
                        onChange={(e) => setData('school', e.target.value)}
                    />
                </Field>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Date" error={errors.class_date}>
                        <input
                            type="date"
                            className={input}
                            value={data.class_date}
                            onChange={(e) => setData('class_date', e.target.value)}
                        />
                    </Field>
                    <Field label="Start time" error={errors.start_time}>
                        <input
                            type="time"
                            className={input}
                            value={data.start_time}
                            onChange={(e) => setData('start_time', e.target.value)}
                        />
                    </Field>
                    <Field label="End time" error={errors.end_time}>
                        <input
                            type="time"
                            className={input}
                            value={data.end_time}
                            onChange={(e) => setData('end_time', e.target.value)}
                        />
                    </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tutor Needed" error={errors.tutors_needed}>
                        <input
                            type="number"
                            min="1"
                            className={input}
                            value={data.tutors_needed}
                            onChange={(e) => setData('tutors_needed', e.target.value)}
                        />
                    </Field>
                    <Field label="Status" error={errors.status}>
                        <select
                            className={input}
                            value={data.status}
                            onChange={(e) => setData('status', e.target.value)}
                        >
                            <option value="proposed">Proposed (open for voting)</option>
                            <option value="finalized">Finalized</option>
                        </select>
                    </Field>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <Link
                        href={route('class-sessions.index')}
                        className="rounded border border-gray-300 px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={processing}
                        className="rounded bg-[#4a78b0] px-5 py-2 text-sm font-semibold text-white hover:bg-[#3e6699] disabled:opacity-50"
                    >
                        Save Class
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}