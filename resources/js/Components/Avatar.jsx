import { UserIcon } from '@/Components/Icons';

// The user's uploaded photo, or a plain person icon when they haven't added one.
export default function Avatar({ user, size = 'h-9 w-9', iconSize = 'h-5 w-5', fallback = 'bg-white text-[#1a237e]' }) {
    if (user.photo_url) {
        return <img src={user.photo_url} alt="" className={`${size} shrink-0 rounded-full object-cover`} />;
    }

    return (
        <span className={`${size} ${fallback} flex shrink-0 items-center justify-center rounded-full`}>
            <UserIcon className={iconSize} />
        </span>
    );
}