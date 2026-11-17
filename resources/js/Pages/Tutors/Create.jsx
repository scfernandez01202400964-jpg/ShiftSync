import TutorForm from '@/Components/TutorForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

export default function Create({ categories }) {
    const first = categories[0];

    const form = useForm({
        username: '',
        full_name: '',
        password: '',
        password_confirmation: '',
        category_id: first?.id ?? '',
        status: 'Active',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('tutors.store'));
    };

    return (
        <AdminLayout>
            <Link href={route('tutors.index')} className="text-sm text-gray-500 hover:underline">
                ← Back to Tutors
            </Link>
            <h1 className="mb-4 mt-2 text-2xl font-bold text-[#1a237e]">Add Tutor</h1>

            <TutorForm form={form} categories={categories} onSubmit={submit} />
        </AdminLayout>
    );
}