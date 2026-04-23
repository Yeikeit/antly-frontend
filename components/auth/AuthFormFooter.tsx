import Link from 'next/link';

type AuthFormFooterProps = {
    text: string;
    linkText: string;
    href: string;
};

export function AuthFormFooter({ text, linkText, href }: AuthFormFooterProps) {
    return (
        <p className="text-center text-sm text-slate-600">
            {text}{' '}
            <Link href={href} className="font-medium text-slate-900 underline">
                {linkText}
            </Link>
        </p>
    );
}