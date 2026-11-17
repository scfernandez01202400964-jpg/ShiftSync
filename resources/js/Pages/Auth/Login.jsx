import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

const field =
    'w-full rounded-xl border-2 border-white/80 bg-gradient-to-r from-[#5fd37a] to-[#7b7fdc] px-4 py-3 text-base text-[#10163f] placeholder-white/90 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/60';
const message = 'mt-2 rounded bg-white/90 px-3 py-1 text-sm font-medium';

function EyeIcon({ hidden }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
            aria-hidden="true"
        >
            {hidden ? (
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                />
            ) : (
                <>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </>
            )}
        </svg>
    );
}

export default function Login({ status }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showHelp, setShowHelp] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <>
            <Head title="Log in" />

            <div className="grid min-h-screen bg-gradient-to-b from-[#1a8a14] to-[#262a74] text-white lg:grid-cols-2 lg:bg-[linear-gradient(90deg,#e9e9e9_0%,#cfe0cf_10%,#5fa65a_24%,#1a8a14_40%,#1d5a3a_60%,#262a74_92%)]">
                <section className="flex flex-col items-center justify-center px-8 py-12 text-center [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">
                    <img
                        src="/images/logo.png"
                        alt="ShiftSync OGS logo"
                        className="h-56 w-auto"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                    <h2 className="mt-4 text-3xl font-bold tracking-wide">ShiftSync OGS</h2>
                    <p className="mt-1 max-w-xs text-sm">Tutor Scheduling, Attendance &amp; Payroll System</p>
                </section>

                <section className="flex flex-col items-center justify-center px-8 py-12">
                    <form onSubmit={submit} className="w-full max-w-md">
                        <h1 className="text-center text-4xl font-bold">WELCOME BACK!</h1>
                        <p className="mb-8 text-center text-sm">Please login to your account</p>

                        {status && (
                            <div className={`${message} mb-4 text-green-800`} role="status">
                                {status}
                            </div>
                        )}

                        <label htmlFor="username" className="mb-1 block font-semibold">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            autoComplete="username"
                            autoFocus
                            required
                            className={field}
                            placeholder="Enter username"
                            value={data.username}
                            onChange={(e) => setData('username', e.target.value)}
                        />
                        {errors.username && <p className={`${message} text-red-700`}>{errors.username}</p>}

                        <label htmlFor="password" className="mb-1 mt-6 block font-semibold">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                className={`${field} pr-12`}
                                placeholder="Enter password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                                aria-pressed={showPassword}
                                className="absolute inset-y-0 right-3 flex items-center text-white"
                            >
                                <EyeIcon hidden={!showPassword} />
                            </button>
                        </div>
                        {errors.password && <p className={`${message} text-red-700`}>{errors.password}</p>}

                        <div className="mt-6 flex items-center justify-between">
                            <label className="flex cursor-pointer items-center gap-3 font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="h-7 w-7 rounded-md border-0 bg-white text-[#1a8a14] focus:ring-2 focus:ring-white/70"
                                />
                                Remember me
                            </label>
                            <button
                                type="button"
                                onClick={() => setShowHelp((v) => !v)}
                                aria-expanded={showHelp}
                                className="font-medium hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>

                        {showHelp && (
                            <p className={`${message} text-[#10163f]`} role="status">
                                Passwords are reset by your admin. Please contact them to set a new one.
                            </p>
                        )}

                        <div className="mt-8 flex justify-center">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-72 rounded-lg bg-[#f5fdff] py-3 font-bold text-[#10163f] hover:bg-white disabled:opacity-60"
                            >
                                Log In
                            </button>
                        </div>
                    </form>

                    <p className="mt-12 text-center text-sm">
                        {new Date().getFullYear()} ShiftSync OGS. All Rights Reserved.
                    </p>
                </section>
            </div>
        </>
    );
}