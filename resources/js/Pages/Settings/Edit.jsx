import { BellIcon, UserIcon } from '@/Components/Icons';
import AdminLayout from '@/Layouts/AdminLayout';
import { router } from '@inertiajs/react';
import { useRef, useState } from 'react';

const REMINDERS = [
    { value: 10, label: '10 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 120, label: '2 hours before' },
];

const SOUNDS = [
    { value: 'bell', label: 'Bell' },
    { value: 'chime', label: 'Chime' },
    { value: 'ding', label: 'Ding' },
    { value: 'none', label: 'None' },
];

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const PHOTO_MAX_BYTES = 50 * 1024 * 1024;

const card = 'rounded-lg bg-white p-5 shadow-sm';
const select =
    'mt-1 w-full rounded-full border-gray-300 px-4 text-sm text-gray-700 focus:border-[#1a237e] focus:ring-[#1a237e]';
const smallButton =
    'rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50';

function Toggle({ label, hint, checked, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div>
                <p className="text-sm font-semibold text-[#1a237e]">{label}</p>
                <p className="text-xs text-gray-500">{hint}</p>
            </div>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className="switch"
            />
        </div>
    );
}

export default function Edit({ profile, preferences }) {
    const [prefs, setPrefs] = useState(preferences);
    const [status, setStatus] = useState('');
    const [photoError, setPhotoError] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInput = useRef(null);

    // Each setting saves as soon as it changes.
    const change = (key, value) => {
        const previous = prefs[key];
        const apply = (v) => {
            setPrefs((p) => ({ ...p, [key]: v }));
            if (key === 'dark_mode') document.documentElement.classList.toggle('dark', v);
        };

        apply(value);
        setStatus('');

        router.patch(
            route('settings.update'),
            { [key]: value },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    setStatus('saved');
                    setTimeout(() => setStatus(''), 2000);
                },
                onError: () => {
                    apply(previous);
                    setStatus('error');
                },
            }
        );
    };

    const choosePhoto = (e) => {
        const file = e.target.files[0];
        e.target.value = ''; // so choosing the same file again still works
        if (!file) return;

        if (!PHOTO_TYPES.includes(file.type)) {
            setPhotoError('Choose a JPG, PNG or WebP image.');
            return;
        }
        if (file.size > PHOTO_MAX_BYTES) {
            setPhotoError('That image is larger than 50 MB. Choose a smaller one.');
            return;
        }

        setPhotoError('');
        router.post(
            route('settings.photo.update'),
            { photo: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setUploading(true),
                onFinish: () => setUploading(false),
                onError: (errors) => setPhotoError(errors.photo ?? 'The photo could not be uploaded.'),
            }
        );
    };

    const removePhoto = () => {
        setPhotoError('');
        router.delete(route('settings.photo.destroy'), { preserveScroll: true });
    };

    return (
        <AdminLayout>
            <h1 className="text-2xl font-bold text-[#1a237e]">Settings</h1>
            <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-gray-500">Manage notifications, appearance &amp; profile</p>
                <p aria-live="polite" className={`text-xs ${status === 'error' ? 'text-red-600' : 'text-green-700'}`}>
                    {status === 'saved' && 'Saved'}
                    {status === 'error' && "Couldn't save that change. Try again."}
                </p>
            </div>

            <div className="grid items-start gap-4 lg:grid-cols-2">
                <div className="space-y-4">
                    <section className={card}>
                        <h2 className="mb-4 flex items-center gap-2 font-semibold text-[#1a237e]">
                            <UserIcon className="h-5 w-5" /> Profile
                        </h2>
                        <div className="flex items-center gap-5">
                            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden bg-gray-200 text-[#2e7d32]">
                                {profile.photo_url ? (
                                    <img
                                        src={profile.photo_url}
                                        alt="Your profile photo"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-16 w-16" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-[#1a237e]">Name: {profile.name}</p>
                                <p className="text-sm font-semibold text-[#1a237e]">Username: {profile.username}</p>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <input
                                        ref={fileInput}
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={choosePhoto}
                                        className="hidden"
                                    />
                                    
                                    {profile.photo_url && (
                                        <button
                                            type="button"
                                            disabled={uploading}
                                            onClick={removePhoto}
                                            className={`${smallButton} text-red-600`}
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                                {photoError && (
                                    <p role="alert" className="mt-1 text-xs text-red-600">
                                        {photoError}
                                    </p>
                                )}
                            </div>
                        </div>
                        <p className="mt-4 font-bold text-[#1a237e]">ID: {profile.id}</p>
                        <p className="text-sm text-gray-700">Email: {profile.email ?? 'Not set'}</p>
                    </section>

                    <section className={card}>
                        <h2 className="mb-4 font-semibold text-[#1a237e]">Appearance</h2>
                        <Toggle
                            label="Dark mode"
                            hint="Switch between light and dark theme"
                            checked={prefs.dark_mode}
                            onChange={(v) => change('dark_mode', v)}
                        />
                    </section>
                </div>

                <section className={card}>
                    <h2 className="mb-5 flex items-center gap-2 text-xl font-semibold text-[#1a237e]">
                        <BellIcon className="h-6 w-6" /> Notification
                    </h2>

                    <div className="space-y-5">
                        <label className="block text-sm font-semibold text-[#1a237e]">
                            Class reminder
                            <select
                                className={select}
                                value={prefs.class_reminder}
                                onChange={(e) => change('class_reminder', Number(e.target.value))}
                            >
                                {REMINDERS.map((r) => (
                                    <option key={r.value} value={r.value}>
                                        {r.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="block text-sm font-semibold text-[#1a237e]">
                            Notification sound
                            <select
                                className={select}
                                value={prefs.notification_sound}
                                onChange={(e) => change('notification_sound', e.target.value)}
                            >
                                {SOUNDS.map((s) => (
                                    <option key={s.value} value={s.value}>
                                        {s.label}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <Toggle
                            label="In-app notifications"
                            hint="Show alerts in the notification bell"
                            checked={prefs.in_app_notifications}
                            onChange={(v) => change('in_app_notifications', v)}
                        />
                        <Toggle
                            label="Voting reminders"
                            hint="When new voting opens"
                            checked={prefs.voting_reminders}
                            onChange={(v) => change('voting_reminders', v)}
                        />
                    </div>
                </section>
            </div>
        </AdminLayout>
    );
}