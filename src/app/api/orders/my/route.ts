export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { listMyOrders } = await import('@/server/routes/api.routes.js');
  return listMyOrders(request);
}
