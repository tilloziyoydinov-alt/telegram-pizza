export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
}

export interface OrderPayload {
  items: Array<{ productId: number; quantity: number }>;
  phone: string;
  address: string;
  comment?: string;
}

export type OrderStatus = 'new' | 'accepted' | 'delivering' | 'done' | 'cancelled';

export interface Order {
  id: number;
  items: Array<{ productId: number; name: string; price: number; quantity: number }>;
  totalPrice: number;
  status: OrderStatus;
  createdAt: string;
}

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

// Standart holatda bir xil domen: Next.js /api/* ni botga proxy qiladi (next.config.mjs)
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';

async function request<T>(path: string, init: RequestInit & { initData?: string } = {}): Promise<T> {
  const { initData, headers, ...rest } = init;
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: {
        'Content-Type': 'application/json',
        // Backend bu imzoni bot tokeni bilan tekshiradi — foydalanuvchini soxtalashtirib bo'lmaydi
        ...(initData ? { Authorization: `tma ${initData}` } : {}),
        ...headers,
      },
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new ApiError('Server bilan aloqa yo‘q. Internetni tekshiring.', 0);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(`${body?.error ?? 'Xatolik'} (${response.status})`, response.status);
  return body as T;
}

export const api = {
  getProducts: () => request<Product[]>('/products'),
  createOrder: (payload: OrderPayload, initData: string) =>
    request<{ id: number; totalPrice: number; status: OrderStatus }>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
      initData,
    }),
  getMyOrders: (initData: string) => request<Order[]>('/orders/my', { initData }),
};
