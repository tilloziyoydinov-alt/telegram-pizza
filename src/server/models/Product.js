import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.js';

const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(128), allowNull: false },
    description: { type: DataTypes.STRING(512), allowNull: false, defaultValue: '' },
    // Narxlar butun so'mda saqlanadi (float yaxlitlash xatolari bo'lmasligi uchun)
    price: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    imageUrl: { type: DataTypes.STRING(512), allowNull: false, defaultValue: '/images/pizza.svg' },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'products', underscored: true },
);

export const DEFAULT_PRODUCTS = [
  { name: 'Margarita', description: 'Pomidor sousi, motsarella, rayhon', price: 59_000 },
  { name: 'Pepperoni', description: 'Pepperoni kolbasa, motsarella', price: 69_000 },
  { name: 'To‘rt pishloq', description: 'Motsarella, chedder, parmezan, dor-blyu', price: 79_000 },
  { name: 'Go‘shtli', description: 'Mol go‘shti, tovuq, kolbasa, piyoz', price: 85_000 },
  { name: 'Qo‘ziqorinli', description: 'Shampinyon, motsarella, qaymoqli sous', price: 65_000 },
];

export default Product;
