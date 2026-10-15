export const dynamic = 'force-dynamic';

// Server modullari faqat so'rov kelganda yuklanadi (build vaqtida .env talab qilinmaydi)
export async function GET(request: Request) {
  const { listProducts } = await import('@/server/routes/api.routes.js');
  return listProducts(request);
}
