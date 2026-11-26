import Link from "next/link";

/**
 * Shared frame for /login and /register.
 *
 * One centred column and nothing else.
 *
 * This had grown a half-screen banner: a headline, four
 * photographs, a counted statistic and a list of four reasons to
 * make an account. All of it was argument, and nobody arrives at a
 * sign-in page needing to be argued with - they are here because
 * they already decided, and everything beside the password field is
 * something to look past. The one fact worth keeping is that an
 * account is not required to buy, which is a sentence, not a panel.
 *
 * Keeping it to one column also keeps it honest on a phone, where
 * the banner was the whole first screen and the password field was
 * below the fold.
 */

export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <div className="page flex justify-center py-16 md:py-24">
      <div className="w-full max-w-[380px]">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
          {kicker}
        </p>
        <h1 className="mt-2.5 text-[27px] font-bold leading-[1.15] tracking-tight text-text-hi">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2.5 text-[13.5px] leading-relaxed text-text-mid">
            {subtitle}
          </p>
        )}

        <div className="mt-8">{children}</div>

        <div className="mt-8 border-t border-hairline pt-6 text-[13px] leading-relaxed text-text-mid">
          {footer}
        </div>

        <p className="mt-4 text-[12.5px] leading-relaxed text-text-low">
          You do not need an account to buy —{" "}
          <Link href="/cart" className="text-accent hover:underline">
            check out as a guest
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
