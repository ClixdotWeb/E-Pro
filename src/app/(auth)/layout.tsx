/**
 * Sign-in, sign-up and password reset.
 *
 * No header and no footer. A sign-in page is one task with one
 * answer, and the shop's chrome around it - a nav of six
 * destinations above, four assurance cards and five columns of
 * links below - is all ways out of that task. The way back to the
 * shop is one link inside the card, which is as much as anyone
 * needs.
 *
 * A separate route group rather than a flag on the shop layout,
 * because "which chrome does this page get" is the thing route
 * groups are for, and the URLs do not change.
 */
export const dynamic = "force-dynamic";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main id="main">{children}</main>;
}
