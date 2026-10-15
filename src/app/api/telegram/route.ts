export const dynamic = 'force-dynamic';
export const maxDuration = 10;

/** Telegram webhook: bot xabarlari shu yerga keladi */
export async function POST(request: Request) {
  const { handleWebhook } = await import('@/server/routes/bot.routes.js');
  return handleWebhook(request);
}
