import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.js';

export const ORDER_STATUSES = ['new', 'accepted', 'delivering', 'done', 'cancelled'];

export const STATUS_LABELS = {
  new: '🆕 Yangi',
  accepted: '👨‍🍳 Tayyorlanmoqda',
  delivering: '🚗 Yo‘lda',
  done: '✅ Yetkazildi',
  cancelled: '❌ Bekor qilindi',
};

const Order = sequelize.define(
  'Order',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    // [{ productId, name, price, quantity }] — buyurtma paytidagi narx "muzlatiladi"
    items: { type: DataTypes.JSON, allowNull: false },
    totalPrice: { type: DataTypes.INTEGER, allowNull: false },
    status: { type: DataTypes.ENUM(...ORDER_STATUSES), allowNull: false, defaultValue: 'new' },
    phone: { type: DataTypes.STRING(20), allowNull: false },
    address: { type: DataTypes.STRING(512), allowNull: false },
    comment: { type: DataTypes.STRING(512) },
  },
  { tableName: 'orders', underscored: true },
);

export default Order;
