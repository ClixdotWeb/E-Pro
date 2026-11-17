/**
 * Health check for Coolify's container health probe and its reverse
 * proxy.
 *
 * Deliberately shallow: it reports that the Node process is up and
 * serving, and nothing else. It does NOT touch the database.
 *
 * That is on purpose. If this probe failed whenever Postgres hiccuped,
 * Coolify would kill and restart a perfectly healthy web container, and
 * a brief database blip would turn into an outage. Database reachability
 * belongs on a separate, non-fatal status endpoint.
 *
 * Route Handlers are uncached by default, which is what a probe needs.
 */
export async function GET() {
  return Response.json(
    {
      status: "ok",
      uptimeSeconds: Math.round(process.uptime()),
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
