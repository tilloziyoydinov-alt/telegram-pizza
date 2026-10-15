export const dynamic = 'force-dynamic';

export async function GET() {
  const { healthReport } = await import('@/server/routes/health.js');
  const { ok, report } = await healthReport();
  return new Response(JSON.stringify(report, null, 2), {
    status: ok ? 200 : 500,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
}
