export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { postOrder } = await import('@/server/routes/api.routes.js');
  return postOrder(request);
}
