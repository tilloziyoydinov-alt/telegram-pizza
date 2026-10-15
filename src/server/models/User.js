import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.js';

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    telegramId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      unique: true,
      // pg BIGINT'ni satr qaytaradi; Telegram ID'lari 2^53 dan kichik — Number xavfsiz
      get() {
        const raw = this.getDataValue('telegramId');
        return raw == null ? raw : Number(raw);
      },
    },
    username: { type: DataTypes.STRING(64) },
    firstName: { type: DataTypes.STRING(128), allowNull: false },
    lastName: { type: DataTypes.STRING(128) },
    languageCode: { type: DataTypes.STRING(8) },
    phone: { type: DataTypes.STRING(20) },
    isBanned: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  },
  { tableName: 'users', underscored: true },
);

export default User;
