import Avatar from '@/Components/Avatar';
import { BellIcon, MenuIcon } from '@/Components/Icons';
import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useLayoutEffect, useState } from 'react';

const POLL_SECONDS = 20; // how often the bell checks for new alerts
const EMPTY_BELL = { unread: 0, recent: [] };

// A link stays greyed out until its page exists, so unfinished pages never cause errors.
const adminNav = [
    { label: 'Dashboard', to: 'dashboard', active: 'dashboard' },
    { label: 'Classes', to: 'class-sessions.index', active: 'class-sessions.*' },
    { label: 'Tutors', to: 'tutors.index', active: 'tutors.*' },
    { label: 'Categories', to: 'categories.index', active: 'categories.*' },
    { label: 'Attendance', to: 'class-tutors.index', active: 'class-tutors.*' },
    { label: 'Payroll', to: 'payroll.index', active: 'payroll.*' },
    { label: 'Settings', to: 'settings.edit', active: 'settings.*' },
];

const tutorNav = [
    { label: 'Dashboard', to: 'dashboard', active: 'dashboard' },
    { label: 'My Schedule', to: 'schedule.index', active: 'schedule.*' },
    { label: 'Voting', to: 'votes.index', active: 'votes.*' },
    { label: 'Attendance', to: 'my-attendance.index', active: 'my-attendance.*' },
    { label: 'Payroll', to: 'my-payroll.index', active: 'my-payroll.*' },
    { label: 'Settings', to: 'settings.edit', active: 'settings.*' },
];

function Bell({ bell }) {
    const [open, setOpen] = useState(false);
    const [live, setLive] = useState(bell);
    const { unread, recent } = live;

    // A fresh page load always brings fresh data.
    useEffect(() => setLive(bell), [bell]);

    // Between page loads, check for new alerts every 20 seconds while this tab is showing.
    useEffect(() => {
        const check = async () => {
            if (document.visibilityState !== 'visible') return;

            try {
                const res = await fetch(route('notifications.summary'), {
                    headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                    credentials: 'same-origin',
                });

                if (res.ok) setLive(await res.json());
            } catch {
                // Offline or logged out: try again next time.
            }
        };

        const timer = setInterval(check, POLL_SECONDS * 1000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === 'Escape' && setOpen(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    const markAllRead = () =>
        router.post(route('notifications.read-all'), {}, { preserveScroll: true, preserveState: true });

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                aria-label={`Notifications, ${unread} unread`}
                className="relative flex items-center text-gray-800"
            >
                <BellIcon className="h-5 w-5" />
                {unread > 0 && (
                    <span
                        aria-hidden="true"
                        className="absolute -right-2 -top-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white"
                    >
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 top-9 z-20 w-80 rounded-lg bg-white p-3 text-gray-800 shadow-lg ring-1 ring-gray-200">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#1a237e]">Notifications</p>
                        {unread > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="text-xs font-medium text-[#1a237e] hover:underline"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    {recent.length === 0 ? (
                        <p className="py-4 text-center text-sm text-gray-500">No notifications yet.</p>
                    ) : (
                        <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
                            {recent.map((n) => (
                                <li key={n.id} className="py-2">
                                    <p className="text-sm font-medium text-gray-900">
                                        {!n.read && (
                                            <span
                                                aria-hidden="true"
                                                className="mr-2 inline-block h-2 w-2 rounded-full bg-[#1a237e]"
                                            />
                                        )}
                                        {n.title}
                                        {!n.read && <span className="sr-only"> (unread)</span>}
                                    </p>
                                    <p className="text-xs text-gray-600">{n.message}</p>
                                    <p className="text-xs text-gray-400">{n.time}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}

export default function AppLayout({ children }) {
    const { auth, flash } = usePage().props;
    const bell = usePage().props.bell ?? EMPTY_BELL;
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const name = auth.user.full_name ?? auth.user.name;
    const nav = auth.user.role === 'tutor' ? tutorNav : adminNav;
    const darkMode = Boolean(auth.user.preferences?.dark_mode);

    // Dark mode is a class on <html>; the dark colors live in resources/css/app.css.
    useLayoutEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
        return () => document.documentElement.classList.remove('dark');
    }, [darkMode]);

    return (
        <div className="flex min-h-screen gap-4 bg-[#e4e6ec] p-4">
            {sidebarOpen && (
                <aside className="sticky top-4 flex h-[calc(100vh-2rem)] w-52 shrink-0 flex-col rounded-2xl bg-gradient-to-b from-[#1a237e] via-[#1b5e20] to-[#b7e4b4] p-4 text-white">
                    <div className="mb-8 rounded bg-white px-3 py-2 text-sm italic text-[#1a237e]">
                        ShiftSync OGS
                    </div>

                    <nav className="flex-1 space-y-1">
                        {nav.map((item) => {
                            const base = 'block rounded px-3 py-2 text-sm font-semibold';

                            if (!route().has(item.to)) {
                                return (
                                    <span
                                        key={item.label}
                                        aria-disabled="true"
                                        className={`${base} cursor-not-allowed opacity-50`}
                                    >
                                        {item.label}
                                    </span>
                                );
                            }

                            return (
                                <Link
                                    key={item.label}
                                    href={route(item.to)}
                                    className={`${base} ${
                                        route().current(item.active) ? 'bg-white/20' : 'hover:bg-white/10'
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-2 text-[#1a237e]">
                        <Avatar user={auth.user} />
                        <div className="min-w-0 flex-1 text-sm">
                            <p className="truncate font-medium">{name}</p>
                            <button onClick={() => router.post(route('logout'))} className="text-xs underline">
                                Log out
                            </button>
                        </div>
                    </div>
                </aside>
            )}

            <div className="min-w-0 flex-1 rounded-2xl bg-[#f1f2f7] p-4">
                <header className="flex items-center gap-3 rounded-full bg-white px-4 py-2 ring-1 ring-gray-200">
                    <button
                        onClick={() => setSidebarOpen((open) => !open)}
                        aria-label="Toggle sidebar"
                        className="text-[#1b5e20]"
                    >
                        <MenuIcon />
                    </button>
                    <div className="flex-1" />
                    <div className="flex items-center gap-3 rounded-full bg-green-100 px-3 py-1">
                        <Bell bell={bell} />
                        <Avatar
                            user={auth.user}
                            size="h-7 w-7"
                            iconSize="h-4 w-4"
                            fallback="bg-[#2e7d32] text-white"
                        />
                    </div>
                </header>

                <main className="px-1 pt-6">
                    {flash?.success && (
                        <div className="mb-4 rounded bg-green-100 px-4 py-3 text-sm text-green-800">
                            {flash.success}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}