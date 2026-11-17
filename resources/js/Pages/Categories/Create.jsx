import CategoryForm from '@/Components/CategoryForm';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

export default function Create() {
    const form = useForm({ name: '', rate: '' });

    const submit = (e) => {
        e.preventDefault();
        form.post(route('categories.store'));
    };

    return (
        <AdminLayout>
            <Link href={route('categories.index')} className="text-sm text-gray-500 hover:underline">
                ← Back to Categories
            </Link>
            <h1 className="mb-4 mt-2 text-2xl font-bold text-[#1a237e]">Add Category</h1>

            <CategoryForm form={form} onSubmit={submit} />
        </AdminLayout>
    );
}