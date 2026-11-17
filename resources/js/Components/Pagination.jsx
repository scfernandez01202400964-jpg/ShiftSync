import { Link } from '@inertiajs/react';

// Laravel labels pages "&laquo; Previous" / "Next &raquo;"; the design uses < and >.
const pageLabel = (label) =>
    label.includes('Previous') ? '<' : label.includes('Next') ? '>' : label;

const box = 'flex h-8 min-w-8 items-center justify-center rounded border px-2 text-sm';

export default function Pagination({ paginator }) {
    if (paginator.last_page <= 1) return null;

    return (
        <div className="mt-4 flex justify-center gap-2">
            {paginator.links
                .filter((l) => l.url || !/Previous|Next/.test(l.label))
                .map((l, i) =>
                    l.url ? (
                        <Link
                            key={i}
                            href={l.url}
                            preserveScroll
                            className={`${box} ${
                                l.active
                                    ? 'border-[#1a237e] bg-[#1a237e] text-white'
                                    : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-100'
                            }`}
                        >
                            {pageLabel(l.label)}
                        </Link>
                    ) : (
                        <span key={i} className={`${box} border-transparent text-gray-400`}>
                            {l.label}
                        </span>
                    )
                )}
        </div>
    );
}