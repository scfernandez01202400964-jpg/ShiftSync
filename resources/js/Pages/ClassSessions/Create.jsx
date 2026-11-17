import { TrashIcon } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

const input = 'w-full rounded border-gray-300 text-sm focus:border-[#1a237e] focus:ring-[#1a237e]';
const button = 'rounded bg-[#4a78b0] px-8 py-2 text-sm font-semibold text-white hover:bg-[#3e6699]';
const emptyClass = { school: '', start_time: '', end_time: '', tutors_needed: 1 };

export default function Create() {
    const { data, setData, post, processing, errors } = useForm({
        class_date: '',
        classes: [{ ...emptyClass }],
    });

    const setClass = (index, field, value) =>
        setData(
            'classes',
            data.classes.map((c, i) => (i === index ? { ...c, [field]: value } : c))
        );
    const addClass = () => setData('classes', [...data.classes, { ...emptyClass }]);
    const removeClass = (index) =>
        setData('classes', data.classes.filter((_, i) => i !== index));

    const rowErrors = (i) =>
        ['school', 'start_time', 'end_time', 'tutors_needed']
            .map((field) => errors[`classes.${i}.${field}`])
            .filter(Boolean);

    const submit = (e) => {
        e.preventDefault();
        post(route('class-sessions.store'));
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Create Class Proposal</h1>
            <Link
                href={route('class-sessions.index')}
                className="mb-4 inline-block text-sm text-gray-500 hover:underline"
            >
                ← Back to Classes
            </Link>

            <form onSubmit={submit}>
                <div className="grid items-start gap-4 lg:grid-cols-[1fr_2fr]">
                    <div className="rounded-lg bg-white p-5 shadow-sm">
                        <label className="block text-sm font-medium text-gray-700">Date</label>
                        <input
                            type="date"
                            className={`${input} mt-1`}
                            value={data.class_date}
                            onChange={(e) => setData('class_date', e.target.value)}
                        />
                        {errors.class_date && <p className="mt-1 text-xs text-red-600">{errors.class_date}</p>}
                        <p className="mt-3 text-xs text-gray-500">
                            All classes on the right are posted for this date.
                        </p>
                    </div>

                    <div className="rounded-lg bg-white p-5 shadow-sm">
                        <p className="text-sm font-medium text-gray-700">Proposed Classes</p>

                        <div className="mt-2 space-y-3">
                            {data.classes.map((c, i) => (
                                <div key={i} className="rounded border border-gray-200 p-3">
                                    <div className="flex items-center gap-2">
                                        <input
                                            className={input}
                                            aria-label={`School name for class ${i + 1}`}
                                            placeholder="School name (e.g. Sakuragaoka)"
                                            value={c.school}
                                            onChange={(e) => setClass(i, 'school', e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeClass(i)}
                                            disabled={data.classes.length === 1}
                                            aria-label={`Remove class ${i + 1}`}
                                            className="text-gray-800 hover:text-red-600 disabled:opacity-30"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="mt-2 grid grid-cols-3 gap-2">
                                        <label className="text-xs text-gray-500">
                                            Start
                                            <input
                                                type="time"
                                                className={`${input} mt-1`}
                                                value={c.start_time}
                                                onChange={(e) => setClass(i, 'start_time', e.target.value)}
                                            />
                                        </label>
                                        <label className="text-xs text-gray-500">
                                            End
                                            <input
                                                type="time"
                                                className={`${input} mt-1`}
                                                value={c.end_time}
                                                onChange={(e) => setClass(i, 'end_time', e.target.value)}
                                            />
                                        </label>
                                        <label className="text-xs text-gray-500">
                                            Tutors needed
                                            <input
                                                type="number"
                                                min="1"
                                                className={`${input} mt-1`}
                                                value={c.tutors_needed}
                                                onChange={(e) => setClass(i, 'tutors_needed', e.target.value)}
                                            />
                                        </label>
                                    </div>

                                    {rowErrors(i).map((message) => (
                                        <p key={message} className="mt-1 text-xs text-red-600">
                                            {message}
                                        </p>
                                    ))}
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex justify-center">
                            <button type="button" onClick={addClass} className={button}>
                                Add Class
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-center gap-4">
                    <Link href={route('class-sessions.index')} className={button}>
                        Cancel
                    </Link>
                    <button type="submit" disabled={processing} className={`${button} disabled:opacity-50`}>
                        Publish Proposal
                    </button>
                </div>
            </form>
        </AdminLayout>
    );
}