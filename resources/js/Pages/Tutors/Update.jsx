import TutorForm from '@/Components/TutorForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

export default function Update({ tutor, categories }) {
    const form = useForm({
        username: tutor.username ?? '',
        full_name: tutor.full_name ?? '',
        password: '',
        password_confirmation: '',
        category_id: tutor.category_id ?? categories[0]?.id ?? '',
        status: tutor.status,
    });

    const submit = (e) => {
        e.preventDefault();
        form.put(route('tutors.update', tutor.id));
    };

    return (
        <AdminLayout>
            <Link href={route('tutors.index')} className="text-sm text-gray-500 hover:underline">
                ← Back to Tutors
            </Link>
            <h1 className="mb-4 mt-2 text-2xl font-bold text-[#1a237e]">Edit Tutor</h1>

            <TutorForm form={form} categories={categories} onSubmit={submit} editing />
        </AdminLayout>
    );
}