import { z } from 'zod';
import { CartError, createOrder, getUserOrders } from '../controllers/cartController.js';
import { createRateLimiter } from '../middlewares/rateLimit.middleware.js';
import { authenticate } from '../middlewares/telegramAuth.middleware.js';
import { ensureDatabase, Product } from '../models/index.js';
import logger from '../utils/logger.js';
import { getBot } from './bot.routes.js';

const orderSchema = z.object({
  items: z
    .array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(50) }))
    .min(1)
    .max(30),
  phone: z
    .string()
    .trim()
    .regex(/^\+?998\d{9}$/, 'Telefon raqam +998XXXXXXXXX formatida bo‘lishi kerak'),
  address: z.string().trim().min(5).max(500),
  comment: z.string().trim().max(500).optional(),
});

const rateLimit = createRateLimiter({ windowMs: 60_000, limit: 60 });

/** Har bir API handler uchun umumiy qobiq: rate-limit, DB, xatolarni ushlash va loglash */
function route(fn) {
  return async (request) => {
    const limited = rateLimit(request);
    if (limited) return limited;
    try {
      await ensureDatabase();
      return await fn(request);
    } catch (err) {
      logger.error(err instanceof Error ? err : new Error(String(err)), { method: request.method, url: request.url });
      return Response.json({ error: 'Serverda xatolik' }, { status: 500 });
    }
  };
}

/** GET /api/products */
export const listProducts = route(async () => {
  const products = await Product.findAll({
    where: { isActive: true },
    attributes: ['id', 'name', 'description', 'price', 'imageUrl'],
    order: [['id', 'ASC']],
  });
  return Response.json(products, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
});

/** POST /api/orders */
export const postOrder = route(async (request) => {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'JSON noto‘g‘ri' }, { status: 400 });
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0]?.message ?? 'Ma’lumotlar noto‘g‘ri' }, { status: 400 });
  }

  try {
    const order = await createOrder(getBot().api, auth.user, parsed.data);
    return Response.json({ id: order.id, totalPrice: order.totalPrice, status: order.status }, { status: 201 });
  } catch (err) {
    if (err instanceof CartError) return Response.json({ error: err.message }, { status: 409 });
    throw err;
  }
});

/** GET /api/orders/my */
export const listMyOrders = route(async (request) => {
  const auth = await authenticate(request);
  if (auth instanceof Response) return auth;
  const orders = await getUserOrders(auth.user.id);
  return Response.json(
    orders.map(({ id, items, totalPrice, status, createdAt }) => ({ id, items, totalPrice, status, createdAt })),
  );
});
