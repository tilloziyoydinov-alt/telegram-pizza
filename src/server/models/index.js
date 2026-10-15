import { connectDatabase } from '../database/connection.js';
import Order from './Order.js';
import Product, { DEFAULT_PRODUCTS } from './Product.js';
import User from './User.js';

User.hasMany(Order, { foreignKey: { name: 'userId', allowNull: false }, as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

async function seedProducts() {
  if ((await Product.count()) === 0) await Product.bulkCreate(DEFAULT_PRODUCTS);
}

let ready;
/** Har bir serverless instansiyada bir marta: ulanish + jadvallar + boshlang'ich menyu */
export function ensureDatabase() {
  ready ??= (async () => {
    await connectDatabase();
    await seedProducts();
  })().catch((err) => {
    ready = undefined; // keyingi so'rovda qayta urinadi
    throw err;
  });
  return ready;
}

export { Order, Product, User };
